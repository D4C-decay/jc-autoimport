import 'reflect-metadata';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { createRemoteJWKSet, jwtVerify, type JWTPayload, type JWTVerifyGetKey } from 'jose';
import type { Request } from 'express';
import { AppConfigService } from '../../core/config/app-config.service.js';
import { PrismaService } from '../../core/database/prisma.service.js';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator.js';
import type { JwtPayload } from '../types/index.js';
import type { UserRole } from '../../../generated/prisma/client.js';

type SupabaseClaims = JWTPayload & {
  email?: string;
  role?: string;
  aal?: string;
  session_id?: string;
};

/**
 * Verifies the Supabase Auth access token (asymmetric keys via JWKS, or the
 * legacy HS256 secret) and resolves the local user row.
 *
 * The local `users.id` is what controllers receive as `sub`, so no endpoint
 * had to change: `auth_id` is the bridge to `auth.users.id`.
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly jwks?: JWTVerifyGetKey;
  private readonly issuer: string;

  constructor(
    private readonly config: AppConfigService,
    private readonly prisma: PrismaService,
    private readonly reflector: Reflector,
  ) {
    const supabase = this.config.supabase;
    this.issuer = supabase.url ? `${supabase.url}/auth/v1` : '';
    this.jwks = supabase.jwksUrl
      ? createRemoteJWKSet(new URL(supabase.jwksUrl))
      : undefined;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request & { user?: JwtPayload }>();
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException('Authentication required');
    }

    const claims = await this.verifyToken(token).catch(() => {
      throw new UnauthorizedException('Invalid or expired token');
    });
    const authId = claims.sub;

    if (!authId) {
      throw new UnauthorizedException('Invalid token subject');
    }

    const user = await this.resolveUser(authId, claims.email);

    if (!user) {
      throw new UnauthorizedException('User not provisioned');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    request.user = {
      sub: user.id,
      authId,
      email: user.email,
      role: user.role as UserRole,
      firstName: user.firstName,
      lastName: user.lastName,
      aal: claims.aal,
    };

    return true;
  }

  /**
   * Looks the identity up by `auth_id`. On the first request after an import
   * (or after a signup that bypassed the trigger) it links a legacy row with
   * the same email, so old users keep their leads and reservations.
   */
  private async resolveUser(authId: string, email?: string) {
    const byAuthId = await this.prisma.user.findUnique({ where: { authId } });
    if (byAuthId) return byAuthId;

    if (!email) return null;

    const byEmail = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!byEmail || byEmail.authId) return null;

    return this.prisma.user.update({
      where: { id: byEmail.id },
      data: { authId },
    });
  }

  private async verifyToken(token: string): Promise<SupabaseClaims> {
    const supabase = this.config.supabase;

    if (this.jwks) {
      try {
        const { payload } = await jwtVerify(token, this.jwks, {
          ...(this.issuer ? { issuer: this.issuer } : {}),
          audience: 'authenticated',
        });
        return payload as SupabaseClaims;
      } catch (error) {
        // Legacy projects still sign with HS256; only fall back when a secret
        // is configured, and let the HS256 check decide.
        if (!supabase.jwtSecret) throw error;
      }
    }

    if (supabase.jwtSecret) {
      const { payload } = await jwtVerify(
        token,
        new TextEncoder().encode(supabase.jwtSecret),
        {
          ...(this.issuer ? { issuer: this.issuer } : {}),
          audience: 'authenticated',
        },
      );
      return payload as SupabaseClaims;
    }

    throw new UnauthorizedException('Supabase Auth is not configured');
  }

  /** Access token from the `Authorization: Bearer` header set by the web proxy. */
  private extractToken(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' && token ? token : undefined;
  }
}
