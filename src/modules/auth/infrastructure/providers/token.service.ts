import 'reflect-metadata';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomBytes } from 'node:crypto';
import { PrismaService } from '../../../../core/database/prisma.service.js';
import { RedisService } from '../../../../core/redis/redis.service.js';
import { AppConfigService } from '../../../../core/config/app-config.service.js';
import type { JwtPayload } from '../../../../common/types/index.js';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: 'Bearer';
}

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly config: AppConfigService,
  ) {}

  async generateTokenPair(payload: JwtPayload): Promise<TokenPair> {
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.config.jwt.accessSecret,
      expiresIn: this.config.jwt.accessExpiresIn as unknown as number,
    });

    const refreshToken = this.generateRefreshToken();

    await this.storeRefreshToken(refreshToken, payload.sub);

    return {
      accessToken,
      refreshToken,
      expiresIn: this.secondsFromNow(this.config.jwt.accessExpiresIn),
      tokenType: 'Bearer',
    };
  }

  async refreshAccessToken(refreshToken: string): Promise<TokenPair> {
    const stored = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!stored) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (stored.expiresAt < new Date()) {
      await this.prisma.refreshToken.delete({ where: { id: stored.id } });
      throw new UnauthorizedException('Refresh token expired, please log in again');
    }

    if (!stored.user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    const payload: JwtPayload = {
      sub: stored.user.id,
      email: stored.user.email,
      role: stored.user.role,
      firstName: stored.user.firstName,
      lastName: stored.user.lastName,
    };

    await this.prisma.refreshToken.delete({ where: { id: stored.id } });

    return this.generateTokenPair(payload);
  }

  async revokeRefreshToken(refreshToken: string): Promise<void> {
    await this.prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
  }

  async revokeAllUserTokens(userId: string): Promise<void> {
    await this.prisma.refreshToken.deleteMany({ where: { userId } });
  }

  async blacklistAccessToken(token: string): Promise<void> {
    const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
      secret: this.config.jwt.accessSecret,
    });

    const now = Date.now();
    const remainingSecs = payload.exp
      ? Math.max(1, payload.exp - Math.floor(now / 1000))
      : 60;

    await this.redis.set(
      `blacklist:${token}`,
      true,
      remainingSecs,
    );
  }

  private generateRefreshToken(): string {
    return randomBytes(48).toString('base64url');
  }

  private async storeRefreshToken(token: string, userId: string): Promise<void> {
    const refreshExpiresInMs = this.msFromNow(this.config.jwt.refreshExpiresIn);

    await this.prisma.refreshToken.create({
      data: {
        token,
        userId,
        expiresAt: new Date(Date.now() + refreshExpiresInMs),
      },
    });
  }

  private secondsFromNow(duration: string): number {
    const ms = this.msFromNow(duration);
    return Math.floor(ms / 1000);
  }

  private msFromNow(duration: string): number {
    const match = duration.match(/^(\d+)([smhdw])$/);
    if (!match) {
      return 15 * 60 * 1000;
    }
    const value = parseInt(match[1], 10);
    const unit = match[2];
    const multipliers: Record<string, number> = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
      w: 7 * 24 * 60 * 60 * 1000,
    };
    return value * (multipliers[unit] ?? 60 * 1000);
  }
}
