import 'reflect-metadata';
import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../../core/database/prisma.service.js';
import { AppConfigService } from '../../../core/config/app-config.service.js';
import { PasswordService } from '../infrastructure/providers/password.service.js';
import { TokenService, type TokenPair } from '../infrastructure/providers/token.service.js';
import { TwoFactorService } from './two-factor.service.js';
import { EmailService } from '../../../shared/services/email.service.js';
import { EncryptionService } from '../../../shared/services/encryption.service.js';
import { RegisterDto } from '../infrastructure/dto/register.dto.js';
import { LoginDto } from '../infrastructure/dto/login.dto.js';
import type { UserRole } from '../../../../generated/prisma/client.js';

export type LoginResult =
  | {
      user: { id: string; email: string; role: UserRole; firstName: string; lastName: string };
      tokens: TokenPair;
    }
  | { requires2FA: true; tempToken: string };

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly password: PasswordService,
    private readonly tokenService: TokenService,
    private readonly twoFactor: TwoFactorService,
    private readonly config: AppConfigService,
    private readonly email: EmailService,
    private readonly encryption: EncryptionService,
  ) {}

  async register(dto: RegisterDto): Promise<{ user: { id: string; email: string; firstName: string; lastName: string; role: UserRole }; tokens: TokenPair }> {
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
      },
      tokens,
    };
  }

  /** Completes a two-factor login: validates the code, then issues tokens. */
  async login2fa(tempToken: string, code: string): Promise<{ user: { id: string; email: string; role: UserRole; firstName: string; lastName: string }; tokens: TokenPair }> {
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
    const resetUrl = `${this.config.app.url}/reset-password?token=${resetToken}`;

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
