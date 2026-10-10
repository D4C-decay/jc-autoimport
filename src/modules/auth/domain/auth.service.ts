import 'reflect-metadata';
import { randomBytes } from 'node:crypto';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../../core/database/prisma.service.js';
import { RedisService } from '../../../core/redis/redis.service.js';
import { AppConfigService } from '../../../core/config/app-config.service.js';
import { PasswordService } from '../infrastructure/providers/password.service.js';
import { TokenService, type TokenPair } from '../infrastructure/providers/token.service.js';
import { TwoFactorService } from './two-factor.service.js';
import { EmailService } from '../../../shared/services/email.service.js';
import { EncryptionService } from '../../../shared/services/encryption.service.js';
import { RegisterDto } from '../infrastructure/dto/register.dto.js';
import { LoginDto } from '../infrastructure/dto/login.dto.js';
import type { UserRole } from '../../../../generated/prisma/client.js';

const EMAIL_VERIFY_TTL_SECONDS = 60 * 60 * 24; // 24 h
const EMAIL_VERIFY_PREFIX = 'email-verify:';

export type LoginResult =
  | {
      user: { id: string; email: string; role: UserRole; firstName: string; lastName: string; emailVerified: boolean };
      tokens: TokenPair;
    }
  | { requires2FA: true; tempToken: string };

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly password: PasswordService,
    private readonly tokenService: TokenService,
    private readonly twoFactor: TwoFactorService,
    private readonly config: AppConfigService,
    private readonly email: EmailService,
    private readonly encryption: EncryptionService,
    private readonly redis: RedisService,
  ) {}

  async register(dto: RegisterDto): Promise<{ user: { id: string; email: string; firstName: string; lastName: string; role: UserRole; emailVerified: boolean }; tokens: TokenPair }> {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await this.password.hash(dto.password);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
        ...(dto.phone ? { phone: this.encryption.encrypt(dto.phone) } : {}),
        role: dto.role ?? 'CLIENT',
      },
    });

    // Envio del correo de confirmacion sin bloquear la respuesta del registro.
    void this.sendVerificationEmail(user).catch((error) => {
      this.logger.error(`No se pudo enviar el correo de verificacion: ${(error as Error).message}`);
    });

    const tokens = await this.tokenService.generateTokenPair({
      sub: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        emailVerified: user.emailVerified,
      },
      tokens,
    };
  }

  async login(dto: LoginDto): Promise<LoginResult> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    const passwordValid = await this.password.verify(user.passwordHash, dto.password);
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Second factor enabled: hand back a short-lived challenge instead of tokens.
    if (user.twoFactorEnabled) {
      const tempToken = await this.twoFactor.createChallenge(user.id);
      return { requires2FA: true, tempToken };
    }

    const tokens = await this.tokenService.generateTokenPair({
      sub: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        emailVerified: user.emailVerified,
      },
      tokens,
    };
  }

  /** Completes a two-factor login: validates the code, then issues tokens. */
  async login2fa(tempToken: string, code: string): Promise<{ user: { id: string; email: string; role: UserRole; firstName: string; lastName: string; emailVerified: boolean }; tokens: TokenPair }> {
    const user = await this.twoFactor.verifyChallenge(tempToken, code);

    const tokens = await this.tokenService.generateTokenPair({
      sub: user.id,
      email: user.email,
      role: user.role as UserRole,
      firstName: user.firstName,
      lastName: user.lastName,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role as UserRole,
        firstName: user.firstName,
        lastName: user.lastName,
        emailVerified: user.emailVerified,
      },
      tokens,
    };
  }

  async refresh(refreshToken: string): Promise<TokenPair> {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token required');
    }
    return this.tokenService.refreshAccessToken(refreshToken);
  }

  async logout(refreshToken?: string): Promise<{ success: boolean }> {
    if (refreshToken) {
      await this.tokenService.revokeRefreshToken(refreshToken);
    }
    return { success: true };
  }

  async forgotPassword(email: string): Promise<{ success: boolean }> {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return { success: true };
    }

    const resetToken = await this.createPasswordResetToken(user.id);
    const resetUrl = `${this.config.app.webUrl}/reset-password?token=${resetToken}`;

    await this.email.send({
      to: user.email,
      subject: 'Restablecer contrasena',
      html: `<p>Hola ${user.firstName},</p><p>Haz clic en el siguiente enlace para restablecer tu contrasena:</p><a href="${resetUrl}">${resetUrl}</a><p>El enlace expira en 1 hora.</p>`,
    });

    return { success: true };
  }

  async resetPassword(token: string, newPassword: string): Promise<{ success: boolean }> {
    const payload = await this.redisSafeTokenVerify(token);
    if (!payload) {
      throw new UnauthorizedException('Invalid or expired reset token');
    }

    const passwordHash = await this.password.hash(newPassword);
    await this.prisma.user.update({
      where: { id: payload.sub },
      data: { passwordHash },
    });

    await this.tokenService.revokeAllUserTokens(payload.sub);

    return { success: true };
  }

  /** Genera un token, lo guarda en Redis y envia el correo de confirmacion. */
  private async sendVerificationEmail(user: { id: string; email: string; firstName: string }): Promise<string> {
    const token = randomBytes(32).toString('hex');
    await this.redis.set(`${EMAIL_VERIFY_PREFIX}${token}`, { userId: user.id }, EMAIL_VERIFY_TTL_SECONDS);

    const verifyUrl = `${this.config.app.webUrl}/verificar?token=${token}`;
    const sent = await this.email.send({
      to: user.email,
      subject: 'Confirma tu correo - JC Autoimport',
      text: `Hola ${user.firstName},\n\nConfirma tu correo abriendo este enlace:\n${verifyUrl}\n\nEl enlace expira en 24 horas.`,
      html: `<p>Hola ${user.firstName},</p><p>Gracias por registrarte en JC Autoimport. Confirma tu correo con el siguiente boton:</p><p><a href="${verifyUrl}">Confirmar correo</a></p><p>O copia este enlace en tu navegador:<br/>${verifyUrl}</p><p>El enlace expira en 24 horas.</p>`,
    });

    if (!sent) {
      this.logger.warn(`Correo de verificacion no enviado (sin SMTP/Resend). Enlace para ${user.email}: ${verifyUrl}`);
    }

    return verifyUrl;
  }

  /** Marca el correo como verificado a partir del token de confirmacion. */
  async verifyEmail(token: string): Promise<{ success: boolean }> {
    if (!token || typeof token !== 'string') {
      throw new BadRequestException('Verification token required');
    }

    const key = `${EMAIL_VERIFY_PREFIX}${token}`;
    const entry = await this.redis.get<{ userId: string }>(key);

    if (!entry?.userId) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    await this.redis.delete(key);

    await this.prisma.user.update({
      where: { id: entry.userId },
      data: { emailVerified: true },
    });

    return { success: true };
  }

  /** Reenvia el correo de confirmacion (respuesta generica, no revela si existe la cuenta). */
  async resendVerification(email: string): Promise<{ success: boolean }> {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (user && !user.emailVerified) {
      await this.sendVerificationEmail(user);
    }

    return { success: true };
  }

  /** Perfil fresco del usuario autenticado (incluye emailVerified). */
  async profile(userId: string): Promise<{ id: string; email: string; role: UserRole; firstName: string; lastName: string; emailVerified: boolean }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, role: true, firstName: true, lastName: true, emailVerified: true },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }

  private async createPasswordResetToken(userId: string): Promise<string> {
    const { encodeCursor } = await import('../../../shared/utils/cursor-encoder.js');
    const crypto = await import('node:crypto');
    const token = crypto.default.randomBytes(32).toString('hex');

    return encodeCursor({ token, sub: userId, purpose: 'password-reset' });
  }

  private async redisSafeTokenVerify(token: string): Promise<{ sub: string } | null> {
    try {
      const { decodeCursor } = await import('../../../shared/utils/cursor-encoder.js');
      const decoded = decodeCursor<{ token: string; sub: string; purpose: string }>(token);
      if (decoded.purpose !== 'password-reset') {
        return null;
      }
      return { sub: decoded.sub };
    } catch {
      return null;
    }
  }
}
