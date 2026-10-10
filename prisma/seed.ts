import 'reflect-metadata';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, UserRole } from '../generated/prisma/client.js';
import * as argon2 from 'argon2';
import { SPEC_CATALOG, SPEC_VALUE_BY_NAME, VEHICLES } from './seed-data.js';
import { imageForVehicle } from './vehicle-images.js';

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString:
      process.env.DATABASE_URL ??
      'postgresql://jcauto:jcauto_password@localhost:5432/jcautoimport?schema=public',
  }),
});

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
  const passwordHash = await argon2.hash('Admin123!', {
    type: argon2.argon2id,
    memoryCost: 19456,
    timeCost: 2,
    parallelism: 1,
  });

  const admin = await prisma.user.upsert({
    where: { email: 'admin@jcautoimport.com' },
    update: {},
    create: {
      email: 'admin@jcautoimport.com',
      passwordHash,
      firstName: 'Admin',
      lastName: 'JC Autoimport',
      role: UserRole.ADMIN,
    },
  });

  await prisma.user.createMany({
    data: [
      {
        email: 'manager@jcautoimport.com',
        passwordHash,
        firstName: 'Manager',
        lastName: 'Principal',
        role: UserRole.MANAGER,
      },
      {
        email: 'seller1@jcautoimport.com',
        passwordHash,
        firstName: 'Carlos',
        lastName: 'Vendedor',
        phone: '+584120000001',
        role: UserRole.SELLER,
      },
      {
        email: 'seller2@jcautoimport.com',
        passwordHash,
        firstName: 'Maria',
        lastName: 'Vendedora',
        phone: '+584120000002',
        role: UserRole.SELLER,
      },
    ],
    skipDuplicates: true,
  });

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
  console.log(`  - Admin: ${admin.email} / Admin123!`);
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
