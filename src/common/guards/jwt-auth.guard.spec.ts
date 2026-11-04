import 'reflect-metadata';
import { describe, expect, it, vi } from 'vitest';
import { UnauthorizedException, type ExecutionContext } from '@nestjs/common';
import type { Reflector } from '@nestjs/core';
import { SignJWT } from 'jose';
import { JwtAuthGuard } from './jwt-auth.guard.js';
import type { AppConfigService } from '../../core/config/app-config.service.js';
import type { PrismaService } from '../../core/database/prisma.service.js';

const URL = 'https://project.supabase.co';
const SECRET = 'test-secret-at-least-32-characters-long';

function token(authId: string, overrides: Record<string, unknown> = {}) {
  return new SignJWT({ email: 'user@example.com', role: 'authenticated', ...overrides })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(authId)
    .setAudience('authenticated')
    .setIssuer(`${URL}/auth/v1`)
    .setIssuedAt()
    .setExpirationTime('5m')
    .sign(new TextEncoder().encode(SECRET));
}

function boot(prisma: unknown) {
  const config = {
    supabase: { url: URL, jwksUrl: '', serviceRoleKey: '', jwtSecret: SECRET },
  } as unknown as AppConfigService;
  const reflector = { getAllAndOverride: () => false } as unknown as Reflector;
  return new JwtAuthGuard(config, prisma as PrismaService, reflector);
}

function contextFor(bearer: string) {
  const request: { headers: Record<string, string>; user?: unknown } = {
    headers: { authorization: `Bearer ${bearer}` },
  };
  const context = {
    switchToHttp: () => ({ getRequest: () => request }),
    getHandler: () => ({}),
    getClass: () => ({}),
  } as unknown as ExecutionContext;
  return { context, request };
}

const localUser = {
  id: 'local-1',
  authId: 'auth-1',
  email: 'user@example.com',
  role: 'CLIENT',
  firstName: 'Ana',
  lastName: 'Pérez',
  isActive: true,
};

describe('JwtAuthGuard (Supabase)', () => {
  it('maps the Supabase subject to the local user id', async () => {
    const findUnique = vi.fn().mockResolvedValue(localUser);
    const guard = boot({ user: { findUnique } });
    const { context, request } = contextFor(await token('auth-1'));

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(findUnique).toHaveBeenCalledWith({ where: { authId: 'auth-1' } });
    expect(request.user).toMatchObject({ sub: 'local-1', authId: 'auth-1', role: 'CLIENT' });
  });

  it('rejects an invalid signature', async () => {
    const guard = boot({ user: { findUnique: vi.fn() } });
    const { context } = contextFor(
      await new SignJWT({ email: 'user@example.com' })
        .setProtectedHeader({ alg: 'HS256' })
        .setSubject('auth-1')
        .setAudience('authenticated')
        .setIssuer(`${URL}/auth/v1`)
        .setExpirationTime('5m')
        .sign(new TextEncoder().encode('another-secret-at-least-32-chars-long')),
    );

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rejects a deactivated local account', async () => {
    const guard = boot({
      user: { findUnique: vi.fn().mockResolvedValue({ ...localUser, isActive: false }) },
    });
    const { context } = contextFor(await token('auth-1'));

    await expect(guard.canActivate(context)).rejects.toThrow('Account is deactivated');
  });

  it('links a legacy row by email on first login', async () => {
    const legacy = { ...localUser, authId: null };
    const findUnique = vi
      .fn()
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(legacy);
    const update = vi.fn().mockResolvedValue({ ...legacy, authId: 'auth-1' });
    const guard = boot({ user: { findUnique, update } });
    const { context, request } = contextFor(await token('auth-1'));

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(update).toHaveBeenCalledWith({
      where: { id: 'local-1' },
      data: { authId: 'auth-1' },
    });
    expect(request.user).toMatchObject({ sub: 'local-1' });
  });
});
