/**
 * One-off migration: copies local users (with their Argon2 hashes) into
 * Supabase Auth and links `public.users.auth_id`.
 *
 * Run after `prisma migrate deploy` and before opening the new login:
 *   npx tsx prisma/import-to-supabase.ts
 *
 * Requires SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY and DATABASE_URL.
 * Idempotent: users already linked (auth_id set) are skipped.
 */
import 'reflect-metadata';
import { existsSync } from 'node:fs';
import { loadEnvFile } from 'node:process';
import { PrismaPg } from '@prisma/adapter-pg';
import { createClient, type User } from '@supabase/supabase-js';
import { PrismaClient } from '../generated/prisma/client.js';

// Standalone script: `tsx` does not load .env by itself.
for (const file of ['.env', '.env.local']) {
  if (existsSync(file)) loadEnvFile(file);
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString:
      process.env.DATABASE_URL ??
      'postgresql://jcauto:jcauto_password@localhost:5432/jcautoimport?schema=public',
  }),
});

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Faltan SUPABASE_URL y/o SUPABASE_SERVICE_ROLE_KEY.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function listAuthUsersByEmail(): Promise<Map<string, User>> {
  const map = new Map<string, User>();
  let page = 1;
  const perPage = 200;

  while (page <= 100) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error) throw new Error(`listUsers: ${error.message}`);
    for (const user of data.users) {
      if (user.email) map.set(user.email.toLowerCase(), user);
    }
    if (data.users.length < perPage) break;
    page += 1;
  }

  return map;
}

async function main(): Promise<void> {
  const users = await prisma.user.findMany({
    where: { authId: null },
    select: {
      id: true,
      email: true,
      passwordHash: true,
      firstName: true,
      lastName: true,
      phone: true,
      role: true,
      emailVerified: true,
    },
    orderBy: { createdAt: 'asc' },
  });

  if (users.length === 0) {
    console.log('No hay usuarios pendientes de enlazar.');
    return;
  }

  const existing = await listAuthUsersByEmail();
  let created = 0;
  let linked = 0;
  let skipped = 0;

  for (const user of users) {
    const email = user.email.toLowerCase();
    let authUser = existing.get(email) ?? null;

    if (!authUser) {
      if (!user.passwordHash) {
        console.warn(`  ! ${email}: sin hash local; se omite (requiere reset de contraseña).`);
        skipped += 1;
        continue;
      }

      const { data, error } = await supabase.auth.admin.createUser({
        email,
        // Supabase accepts bcrypt and Argon2 hashes through the admin API.
        password_hash: user.passwordHash,
        email_confirm: user.emailVerified,
        user_metadata: {
          firstName: user.firstName,
          lastName: user.lastName,
          ...(user.phone ? { phone: user.phone } : {}),
        },
        app_metadata: { role: user.role },
      });

      if (error || !data.user) {
        console.error(`  ! ${email}: ${error?.message ?? 'createUser sin usuario'}`);
        skipped += 1;
        continue;
      }

      authUser = data.user;
      created += 1;
    } else {
      linked += 1;
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { authId: authUser.id },
    });
  }

  console.log('Import completed:');
  console.log(`  - Identities created: ${created}`);
  console.log(`  - Already existing (linked): ${linked}`);
  console.log(`  - Skipped: ${skipped}`);
}

await main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
