import 'reflect-metadata';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, UserRole } from '../generated/prisma/client.js';
import * as argon2 from 'argon2';
import { SPEC_CATALOG, SPEC_VALUE_BY_NAME, VEHICLES } from './seed-data.js';

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString:
      process.env.DATABASE_URL ??
      'postgresql://jcauto:jcauto_password@localhost:5432/jcautoimport?schema=public',
  }),
});

/** Deterministic image pool (verified Unsplash photos of cars). */
const IMAGE_POOL = [
  'photo-1503376780353-7e6692767b70',
  'photo-1494976388531-d1058494cdd8',
  'photo-1552519507-da3b142c6e3d',
  'photo-1541899481282-d53bffe3c35d',
  'photo-1583121274602-3e2820c69888',
  'photo-1502877338535-766e1452684a',
  'photo-1568605117036-5fe5e7bab0b7',
  'photo-1553440569-bcc63803a83d',
  'photo-1590362891991-f776e747a588',
  'photo-1511919884226-fd3cad34687c',
  'photo-1605559424843-9e4c228bf1c2',
  'photo-1618843479313-40f8afb4b4d8',
  'photo-1580273916550-e323be2ae537',
  'photo-1503736334956-4c8f8e92946d',
  'photo-1449965408869-eaa3f722e40d',
  'photo-1533473359331-0135ef1b58bf',
  'photo-1517524008697-84bbe3c3fd98',
  'photo-1519641471654-76ce0107ad1b',
  'photo-1526726538690-5cbf956ae2fd',
  'photo-1533106418989-88406c7cc8ca',
  'photo-1544636331-e26879cd4d9b',
  'photo-1549924231-f129b911e442',
  'photo-1550355291-bbee04a92027',
  'photo-1552642986-ccb41e7059e7',
  'photo-1567808291548-fc3ee04dbcf0',
  'photo-1568844293986-8d0400bd4745',
  'photo-1580414057403-c5f451f30e1c',
  'photo-1583267746897-2cf415887172',
  'photo-1600712242805-5f78671b24da',
  'photo-1606664515524-ed2f786a0bd6',
  'photo-1607853202273-797f1c22a38e',
  'photo-1609521263047-f8f205293f24',
  'photo-1617788138017-80ad40651399',
  'photo-1621993202323-f438eec934ff',
  'photo-1626668893632-6f3a4466d22f',
];

function img(id: string, width: number, quality = 80): string {
  return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=${quality}`;
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
  let skipped = 0;

  for (const v of VEHICLES) {
    const slug = slugify(`${v.brand}-${v.model}-${v.year}-${v.vin.slice(-4)}`);

    const existing = await prisma.vehicle.findUnique({ where: { slug } });
    if (existing) {
      skipped += 1;
      continue;
    }

    const seedIndex = hash(v.vin) % IMAGE_POOL.length;
    const primaryId = IMAGE_POOL[seedIndex];
    const secondaryId = IMAGE_POOL[(seedIndex + 7) % IMAGE_POOL.length];
    const tertiaryId = IMAGE_POOL[(seedIndex + 17) % IMAGE_POOL.length];

    const gallery = [
      { id: primaryId, isPrimary: true, alt: `${v.brand} ${v.model} ${v.year}` },
      { id: secondaryId, isPrimary: false, alt: `${v.brand} ${v.model} interior` },
      { id: tertiaryId, isPrimary: false, alt: `${v.brand} ${v.model} detalle` },
    ];

    const featureNames = SPEC_CATALOG.filter(
      (s) =>
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
        primaryImageUrl: img(primaryId, 1600, 82),
        thumbnailUrl: img(primaryId, 480, 70),
        media: {
          create: gallery.map((g, i) => ({
            type: 'IMAGE' as const,
            url: img(g.id, 1600, 82),
            thumbnailUrl: img(g.id, 480, 70),
            altText: g.alt,
            sortOrder: i,
            isPrimary: g.isPrimary,
            mimeType: 'image/jpeg',
            width: 1600,
            height: 1067,
          })),
        },
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
  console.log(`  - Vehicles created: ${created} (skipped existing: ${skipped})`);
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
