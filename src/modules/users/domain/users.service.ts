import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../core/database/prisma.service.js';
import { SupabaseAdminService } from '../../../core/supabase/supabase-admin.service.js';
import { EncryptionService } from '../../../shared/services/encryption.service.js';
import { UpdateMeDto } from '../infrastructure/dto/update-me.dto.js';
import { CreateUserDto } from '../infrastructure/dto/create-user.dto.js';
import type { UserRole } from '../../../../generated/prisma/client.js';

const safeUserSelect = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  phone: true,
  role: true,
  isActive: true,
  avatarUrl: true,
  createdAt: true,
} as const;

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly supabase: SupabaseAdminService,
    private readonly encryption: EncryptionService,
  ) {}

  /** Decrypts encrypted-at-rest PII before it leaves the service. */
  private present<T extends { phone: string | null }>(user: T): T {
    return { ...user, phone: this.encryption.decrypt(user.phone) };
  }

  private presentAll<T extends { phone: string | null }>(users: T[]): T[] {
    return users.map((u) => this.present(u));
  }

  async findMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: safeUserSelect,
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.present(user);
  }

  async updateMe(userId: string, dto: UpdateMeDto) {
    const current = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { authId: true, email: true },
    });

    if (!current) {
      throw new NotFoundException('User not found');
    }

    if (dto.email) {
      const existing = await this.prisma.user.findUnique({
        where: { email: dto.email.toLowerCase() },
      });
      if (existing && existing.id !== userId) {
        throw new ConflictException('Email already in use');
      }

      // The identity lives in Supabase Auth; keep both sides in sync.
      if (current.authId && dto.email.toLowerCase() !== current.email) {
        await this.supabase.updateEmail(current.authId, dto.email);
      }
    }

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(dto.email ? { email: dto.email.toLowerCase() } : {}),
        ...(dto.firstName ? { firstName: dto.firstName } : {}),
        ...(dto.lastName ? { lastName: dto.lastName } : {}),
        ...(dto.phone !== undefined
          ? { phone: dto.phone ? this.encryption.encrypt(dto.phone) : null }
          : {}),
      },
      select: safeUserSelect,
    });

    return this.present(user);
  }

  async findAll(filter: { search?: string; role?: UserRole; page: number; limit: number }) {
    const where: Record<string, unknown> = {};

    if (filter.search) {
      where.OR = [
        { firstName: { contains: filter.search, mode: 'insensitive' } },
        { lastName: { contains: filter.search, mode: 'insensitive' } },
        { email: { contains: filter.search, mode: 'insensitive' } },
      ];
    }
    if (filter.role) {
      where.role = filter.role;
    }

    const [users, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        select: safeUserSelect,
        orderBy: { createdAt: 'desc' },
        skip: (filter.page - 1) * filter.limit,
        take: filter.limit,
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: this.presentAll(users),
      meta: {
        page: filter.page,
        limit: filter.limit,
        total,
        totalPages: Math.ceil(total / filter.limit),
      },
    };
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: safeUserSelect,
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.present(user);
  }

  async create(dto: CreateUserDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });
    if (existing) {
      throw new ConflictException('Email already in use');
    }

    const role = dto.role ?? 'CLIENT';

    // The credential lives in Supabase Auth; the local row keeps the profile
    // and the business relations.
    const identity = await this.supabase.createUser({
      email: dto.email,
      password: dto.password,
      firstName: dto.firstName,
      lastName: dto.lastName,
      phone: dto.phone,
      role,
    });

    try {
      // The on_auth_user_created trigger normally creates the local row first;
      // upsert keeps this working with or without the trigger.
      const user = await this.prisma.user.upsert({
        where: { authId: identity.id },
        update: {
          email: dto.email.toLowerCase(),
          firstName: dto.firstName,
          lastName: dto.lastName,
          role,
          emailVerified: Boolean(identity.email_confirmed_at),
          ...(dto.phone ? { phone: this.encryption.encrypt(dto.phone) } : {}),
        },
        create: {
          authId: identity.id,
          email: dto.email.toLowerCase(),
          firstName: dto.firstName,
          lastName: dto.lastName,
          ...(dto.phone ? { phone: this.encryption.encrypt(dto.phone) } : {}),
          role,
          emailVerified: Boolean(identity.email_confirmed_at),
        },
        select: safeUserSelect,
      });

      return this.present(user);
    } catch (error) {
      // Do not leave an identity that can log in without a local profile.
      await this.supabase.deleteUser(identity.id);
      throw error;
    }
  }

  async updateUserRole(id: string, role: UserRole) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: { role },
      select: safeUserSelect,
    });
    return this.present(updated);
  }

  async setActive(id: string, isActive: boolean) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: { isActive },
      select: safeUserSelect,
    });
    return this.present(updated);
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
  }
}
