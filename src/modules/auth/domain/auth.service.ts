import 'reflect-metadata';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../../core/database/prisma.service.js';
import type { UserRole } from '../../../../generated/prisma/client.js';

export interface Profile {
  id: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  emailVerified: boolean;
}

/**
 * Supabase Auth owns credentials, verification and MFA. The API only exposes
 * the local profile linked to the Supabase identity.
 */
@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async profile(userId: string): Promise<Profile> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        emailVerified: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }
}
