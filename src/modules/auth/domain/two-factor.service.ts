import 'reflect-metadata';
import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import QRCode from 'qrcode';
import { PrismaService } from '../../../core/database/prisma.service.js';
import { AppConfigService } from '../../../core/config/app-config.service.js';
import { EncryptionService } from '../../../shared/services/encryption.service.js';
import {
  generateTotpSecret,
  totpUri,
  verifyTotp,
} from '../../../shared/utils/totp.js';

type TwoFactorUser = {
  id: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  emailVerified: boolean;
};

@Injectable()
export class TwoFactorService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly encryption: EncryptionService,
    private readonly config: AppConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async status(userId: string): Promise<{ enabled: boolean }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { twoFactorEnabled: true },
    });
    return { enabled: user?.twoFactorEnabled ?? false };
  }

  async setup(userId: string): Promise<{ secret: string; otpauthUrl: string; qrDataUrl: string }> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('User not found');
    if (user.twoFactorEnabled) {
      throw new BadRequestException('2FA is already enabled');
    }

    const secret = generateTotpSecret();
    await this.prisma.user.update({
      where: { id: userId },
      data: { twoFactorSecret: this.encryption.encrypt(secret), twoFactorEnabled: false },
    });

    const issuer = this.config.app.name || 'JC Autoimport';
    const otpauthUrl = totpUri(secret, user.email, issuer);
    const qrDataUrl = await QRCode.toDataURL(otpauthUrl, { margin: 1, width: 240 });

    return { secret, otpauthUrl, qrDataUrl };
  }

  async enable(userId: string, code: string): Promise<{ enabled: boolean }> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('User not found');
    if (user.twoFactorEnabled) return { enabled: true };
    if (!user.twoFactorSecret) {
      throw new BadRequestException('Start 2FA setup before enabling it');
    }

    const secret = this.encryption.decrypt(user.twoFactorSecret);
    if (!verifyTotp(secret, code)) {
      throw new BadRequestException('Invalid verification code');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { twoFactorEnabled: true },
    });
    return { enabled: true };
  }

  async disable(userId: string, code: string): Promise<{ enabled: boolean }> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('User not found');
    if (!user.twoFactorEnabled) return { enabled: false };

    const secret = this.encryption.decrypt(user.twoFactorSecret ?? '');
    if (!verifyTotp(secret, code)) {
      throw new BadRequestException('Invalid verification code');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { twoFactorEnabled: false, twoFactorSecret: null },
    });
    return { enabled: false };
  }

  /** Short-lived token handed to the client between password and code steps. */
  async createChallenge(userId: string): Promise<string> {
    return this.jwtService.signAsync(
      { sub: userId, purpose: '2fa' },
      { secret: this.config.jwt.accessSecret, expiresIn: '5m' },
    );
  }

  async verifyChallenge(tempToken: string, code: string): Promise<TwoFactorUser> {
    let payload: { sub: string; purpose?: string };
    try {
      payload = await this.jwtService.verifyAsync(tempToken, {
        secret: this.config.jwt.accessSecret,
      });
    } catch {
      throw new UnauthorizedException('Two-factor session expired');
    }

    if (payload.purpose !== '2fa') {
      throw new UnauthorizedException('Invalid two-factor token');
    }

    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user || !user.isActive || !user.twoFactorEnabled || !user.twoFactorSecret) {
      throw new UnauthorizedException('Two-factor not available for this user');
    }

    const secret = this.encryption.decrypt(user.twoFactorSecret);
    if (!verifyTotp(secret, code)) {
      throw new UnauthorizedException('Invalid verification code');
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      emailVerified: user.emailVerified,
    };
  }
}
