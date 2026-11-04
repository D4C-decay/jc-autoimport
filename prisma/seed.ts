import 'reflect-metadata';
import { existsSync } from 'node:fs';
import { loadEnvFile } from 'node:process';
import { PrismaPg } from '@prisma/adapter-pg';
import { createClient, type SupabaseClient, type User } from '@supabase/supabase-js';
import { PrismaClient, UserRole } from '../generated/prisma/client.js';
import * as argon2 from 'argon2';
import { SPEC_CATALOG, SPEC_VALUE_BY_NAME, VEHICLES } from './seed-data.js';
import { imageForVehicle } from './vehicle-images.js';

// Works both via `prisma db seed` and `tsx prisma/seed.ts`.
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
const supabase: SupabaseClient | null =
  supabaseUrl && serviceRoleKey
    ? createClient(supabaseUrl, serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      })
    : null;

const SEED_PASSWORD = 'Admin123!';

interface SeedUser {
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phone?: string;
}

const SEED_USERS: SeedUser[] = [
  {
    email: 'admin@jcautoimport.com',
    firstName: 'Admin',
    lastName: 'JC Autoimport',
    role: UserRole.ADMIN,
  },
  {
    email: 'manager@jcautoimport.com',
    firstName: 'Manager',
    lastName: 'Principal',
    role: UserRole.MANAGER,
  },
  {
    email: 'seller1@jcautoimport.com',
    firstName: 'Carlos',
    lastName: 'Vendedor',
    role: UserRole.SELLER,
    phone: '+584120000001',
  },
  {
    email: 'seller2@jcautoimport.com',
    firstName: 'Maria',
    lastName: 'Vendedora',
    role: UserRole.SELLER,
    phone: '+584120000002',
  },
];

async function findAuthUserByEmail(email: string): Promise<User | null> {
  if (!supabase) return null;
  const target = email.toLowerCase();
  let page = 1;
  const perPage = 200;

  while (page <= 50) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error) {
      console.warn(`  ! No se pudo listar usuarios de Supabase: ${error.message}`);
      return null;
    }
    const match = data.users.find((u) => u.email?.toLowerCase() === target);
    if (match) return match;
    if (data.users.length < perPage) return null;
    page += 1;
  }

  return null;
}

/** Creates the Supabase identity (if configured) and returns its uuid. */
async function ensureIdentity(user: SeedUser): Promise<string | null> {
  if (!supabase) return null;

  const existing = await findAuthUserByEmail(user.email);
  if (existing) return existing.id;

  const { data, error } = await supabase.auth.admin.createUser({
    email: user.email.toLowerCase(),
    password: SEED_PASSWORD,
    email_confirm: true,
    user_metadata: {
      firstName: user.firstName,
      lastName: user.lastName,
      ...(user.phone ? { phone: user.phone } : {}),
    },
    app_metadata: { role: user.role },
  });

  if (error || !data.user) {
    console.warn(`  ! No se pudo crear ${user.email} en Supabase: ${error?.message}`);
    return null;
  }

  return data.user.id;
}

function hash(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

function slugify(v: string): string {
  return v
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function main(): Promise<void> {
  // Argon2 hash kept only so the import script can hand it to Supabase Auth.
  const passwordHash = await argon2.hash(SEED_PASSWORD, {
    type: argon2.argon2id,
    memoryCost: 19456,
    timeCost: 2,
    parallelism: 1,
  });

  let admin: { email: string } | null = null;
  let identities = 0;

  for (const seedUser of SEED_USERS) {
    const authId = await ensureIdentity(seedUser);
    if (authId) identities += 1;

    const user = await prisma.user.upsert({
      where: { email: seedUser.email },
      update: {
        role: seedUser.role,
        ...(authId ? { authId } : {}),
      },
      create: {
        email: seedUser.email,
        passwordHash,
        firstName: seedUser.firstName,
        lastName: seedUser.lastName,
        ...(seedUser.phone ? { phone: seedUser.phone } : {}),
        role: seedUser.role,
        ...(authId ? { authId } : {}),
      },
    });

    if (seedUser.role === UserRole.ADMIN) {
      admin = { email: user.email };
    }
  }

  if (!supabase) {
    console.warn(
      '  ! SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY no definidos: usuarios creados solo en local.',
    );
  }

  const specs: Record<string, string> = {};
  for (const spec of SPEC_CATALOG) {
    const created = await prisma.specification.upsert({
      where: { name: spec.name },
      update: { category: spec.category, icon: spec.icon },
      create: { name: spec.name, category: spec.category, icon: spec.icon },
    });
    specs[spec.name] = created.id;
  }

  let created = 0;
  let updated = 0;

  for (const v of VEHICLES) {
    const slug = slugify(`${v.brand}-${v.model}-${v.year}-${v.vin.slice(-4)}`);

    // Local, model-matched photo (see prisma/vehicle-images.ts + CREDITS.md).
    // Falls back to null when there is no curated photo for the model.
    const primaryImageUrl = imageForVehicle(v.brand, v.model);
    const thumbnailUrl = primaryImageUrl;

    const mediaRow = primaryImageUrl
      ? {
          type: 'IMAGE' as const,
          url: primaryImageUrl,
          thumbnailUrl,
          altText: `${v.brand} ${v.model} ${v.year}`,
          sortOrder: 0,
          isPrimary: true,
          mimeType: 'image/webp',
          width: 1600,
          height: 1067,
        }
      : null;

    const existing = await prisma.vehicle.findUnique({ where: { slug } });
    if (existing) {
      // Only refresh the image fields + media so other edits are preserved.
      await prisma.media.deleteMany({ where: { vehicleId: existing.id } });
      await prisma.vehicle.update({
        where: { id: existing.id },
        data: {
          primaryImageUrl,
          thumbnailUrl,
          ...(mediaRow ? { media: { create: [mediaRow] } } : {}),
        },
      });
      updated += 1;
      continue;
    }

    const featureNames = SPEC_CATALOG.filter((s) =>
      v.features.some((f) =>
        f.toLowerCase().includes(s.name.toLowerCase().split(' ')[0].toLowerCase()),
      ),
    );

    await prisma.vehicle.create({
      data: {
        vin: v.vin,
        slug,
        brand: v.brand,
        model: v.model,
        year: v.year,
        transmission: v.transmission,
        driveType: v.driveType,
        fuelType: v.fuelType,
        bodyType: v.bodyType,
        engineSize: v.engineSize,
        horsepower: v.horsepower,
        mileage: v.mileage,
        price: v.price,
        originalPrice: v.originalPrice,
        color: v.color,
        interiorColor: v.interiorColor,
        doors: v.doors ?? 4,
        seats: v.seats ?? 5,
        status: v.status ?? 'AVAILABLE',
        description: v.description,
        isFeatured: v.isFeatured ?? false,
        countryOfOrigin: v.countryOfOrigin,
        portOfEntry: v.portOfEntry,
        importDate: new Date(Date.now() - (hash(v.vin) % 400) * 86_400_000),
        publishedAt: new Date(),
        features: v.features,
        primaryImageUrl,
        thumbnailUrl,
        ...(mediaRow ? { media: { create: [mediaRow] } } : {}),
        specifications: {
          create: featureNames.map((s) => ({
            specificationId: specs[s.name],
            value: SPEC_VALUE_BY_NAME[s.name] ?? 'Si',
          })),
        },
      },
    });
    created += 1;
  }

  const total = await prisma.vehicle.count();
  const featured = await prisma.vehicle.count({ where: { isFeatured: true } });
  const mediaCount = await prisma.media.count();

  console.log('Seed completed:');
  console.log(`  - Admin: ${admin?.email ?? 'admin@jcautoimport.com'} / ${SEED_PASSWORD}`);
  console.log(`  - Supabase identities: ${identities}/${SEED_USERS.length}`);
  console.log(`  - Specifications: ${Object.keys(specs).length}`);
  console.log(`  - Vehicles created: ${created} (images refreshed: ${updated})`);
  console.log(`  - Vehicles in DB: ${total} (featured: ${featured})`);
  console.log(`  - Media rows: ${mediaCount}`);
}

await main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
