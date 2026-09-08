import 'reflect-metadata';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, UserRole } from '../generated/prisma/client.js';
import * as argon2 from 'argon2';

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString:
      process.env.DATABASE_URL ??
      'postgresql://jcauto:jcauto_password@localhost:5432/jcautoimport?schema=public',
  }),
});

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

  const managers = await prisma.user.createMany({
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

  const specificationNames: Array<{ name: string; category: string }> = [
    { name: 'Bluetooth', category: 'Confort' },
    { name: 'Camara de retroceso', category: 'Seguridad' },
    { name: 'Asientos de cuero', category: 'Confort' },
    { name: 'Sunroof', category: 'Confort' },
    { name: 'Control crucero', category: 'Confort' },
    { name: 'Sensores de estacionamiento', category: 'Seguridad' },
    { name: 'Aire acondicionado dual', category: 'Confort' },
    { name: 'Navegacion GPS', category: 'Tecnologia' },
  ];

  const specs: Record<string, string> = {};
  for (const spec of specificationNames) {
    const created = await prisma.specification.upsert({
      where: { name: spec.name },
      update: {},
      create: { name: spec.name, category: spec.category },
    });
    specs[spec.name] = created.id;
  }

  const demoVehicles = [
    {
      vin: '1HGCM82633A004352',
      brand: 'Toyota',
      model: 'RAV4',
      year: new Date().getFullYear(),
      transmission: 'AUTOMATIC',
      driveType: 'AWD',
      fuelType: 'HYBRID',
      bodyType: 'SUV',
      engineSize: 2.5,
      horsepower: 219,
      mileage: 15_000,
      price: 32_500,
      color: 'Pearl White',
      description:
        'Toyota RAV4 Hibrido con mantenimiento al dia, unico dueno, lista para importar.',
    },
    {
      vin: '1FTEW1E55JFA28002',
      brand: 'Ford',
      model: 'F-150 Lariat',
      year: new Date().getFullYear() - 2,
      transmission: 'AUTOMATIC',
      driveType: 'FOUR_X_FOUR',
      fuelType: 'GASOLINE',
      bodyType: 'PICKUP',
      engineSize: 3.5,
      horsepower: 400,
      mileage: 38_000,
      price: 48_900,
      color: 'Velocity Blue',
      description: 'Ford F-150 Lariat 4x4, interior premium, tecnologia SYNC 4.',
    },
    {
      vin: '1N4BL4DV4NN212233',
      brand: 'Nissan',
      model: 'Altima',
      year: new Date().getFullYear() - 1,
      transmission: 'CVT',
      driveType: 'FWD',
      fuelType: 'GASOLINE',
      bodyType: 'SEDAN',
      engineSize: 2.5,
      horsepower: 188,
      mileage: 22_000,
      price: 21_700,
      color: 'Gun Metallic',
      description: 'Nissan Altima con paquete de seguridad ProPILOT Assist.',
    },
  ];

  for (const v of demoVehicles) {
    const slugBase = `${v.brand.toLowerCase()}-${v.model.toLowerCase().replace(/\s+/g, '-')}-${v.year}`;
    const existing = await prisma.vehicle.findUnique({ where: { slug: slugBase } });
    if (existing) continue;

    await prisma.vehicle.create({
      data: {
        vin: v.vin,
        slug: slugBase,
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
        color: v.color,
        status: 'AVAILABLE',
        description: v.description,
        isFeatured: true,
        specifications: {
          create: Object.values(specs).map((specId) => ({
            specificationId: specId,
            value: 'Si',
          })),
        },
      },
    });
  }

  console.log('Seed completed:');
  console.log(`  - Admin: ${admin.email}`);
  console.log(`  - Users created (or already present): ${managers.count}`);
  console.log(`  - Demo vehicles: 3`);
}

await main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });