import 'reflect-metadata';
import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { createClient, type SupabaseClient, type User } from '@supabase/supabase-js';
import { AppConfigService } from '../config/app-config.service.js';

/**
 * Server-side Supabase client (service role). Used only for auth admin
 * operations: provisioning users, syncing email changes and deleting
 * identities. The public web never sees this key.
 */
@Injectable()
export class SupabaseAdminService {
  private readonly logger = new Logger(SupabaseAdminService.name);
  private client?: SupabaseClient;

  constructor(private readonly config: AppConfigService) {}

  get isConfigured(): boolean {
    const { url, serviceRoleKey } = this.config.supabase;
    return Boolean(url && serviceRoleKey);
  }

  private get admin(): SupabaseClient {
    if (!this.client) {
      const { url, serviceRoleKey } = this.config.supabase;
      if (!url || !serviceRoleKey) {
        throw new ServiceUnavailableException('Supabase Auth is not configured');
      }
      this.client = createClient(url, serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });
    }
    return this.client;
  }

  async createUser(input: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role: string;
  }): Promise<User> {
    const { data, error } = await this.admin.auth.admin.createUser({
      email: input.email.toLowerCase(),
      password: input.password,
      email_confirm: true,
      user_metadata: {
        firstName: input.firstName,
        lastName: input.lastName,
        ...(input.phone ? { phone: input.phone } : {}),
      },
      app_metadata: { role: input.role },
    });

    if (error || !data.user) {
      this.logger.error(`Supabase createUser failed for ${input.email}: ${error?.message}`);
      throw new ServiceUnavailableException(
        `No se pudo crear la identidad en Supabase: ${error?.message ?? 'error desconocido'}`,
      );
    }

    return data.user;
  }

  async updateEmail(authId: string, email: string): Promise<void> {
    const { error } = await this.admin.auth.admin.updateUserById(authId, {
      email: email.toLowerCase(),
      email_confirm: true,
    });

    if (error) {
      this.logger.error(`Supabase updateUser failed for ${authId}: ${error.message}`);
      throw new ServiceUnavailableException(
        `No se pudo actualizar el correo en Supabase: ${error.message}`,
      );
    }
  }

  async deleteUser(authId: string): Promise<void> {
    const { error } = await this.admin.auth.admin.deleteUser(authId);
    if (error) {
      this.logger.warn(`Supabase deleteUser failed for ${authId}: ${error.message}`);
    }
  }

  /** Finds an existing identity by email (used by the import script). */
  async findByEmail(email: string): Promise<User | null> {
    const target = email.toLowerCase();
    let page = 1;
    const perPage = 200;

    while (page <= 50) {
      const { data, error } = await this.admin.auth.admin.listUsers({ page, perPage });
      if (error) {
        throw new ServiceUnavailableException(
          `No se pudo listar usuarios de Supabase: ${error.message}`,
        );
      }

      const match = data.users.find((user) => user.email?.toLowerCase() === target);
      if (match) return match;
      if (data.users.length < perPage) return null;
      page += 1;
    }

    return null;
  }
}
