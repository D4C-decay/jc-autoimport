import 'reflect-metadata';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { VehiclesRepository } from './vehicles.repository.js';
import { encodeCursor } from '../../../shared/utils/cursor-encoder.js';
import type { PrismaService } from '../../../core/database/prisma.service.js';
import type { VehicleFilterDto } from '../infrastructure/dto/vehicle-filter.dto.js';

function makeVehicle(overrides: Record<string, unknown> = {}) {
  return {
    id: 'v1',
    slug: 'toyota-rav4-2026',
    brand: 'Toyota',
    model: 'RAV4',
    year: 2026,
    price: 45000,
    mileage: 10,
    fuelType: 'HYBRID',
    bodyType: 'SUV',
    transmission: 'AUTOMATIC',
    driveType: '4WD',
    horsepower: 219,
    color: 'Plata',
    status: 'AVAILABLE',
    isFeatured: false,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    primaryImageUrl: 'https://cdn.example.com/rav4-main.webp',
    thumbnailUrl: 'https://cdn.example.com/rav4-thumb.webp',
    ...overrides,
  };
}

describe('VehiclesRepository', () => {
  let repo: VehiclesRepository;
  let findMany: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    findMany = vi.fn();
    const prisma = { vehicle: { findMany } } as unknown as PrismaService;
    repo = new VehiclesRepository(prisma);
  });

  it('uses denormalized image columns and does not query the media relation', async () => {
    findMany.mockResolvedValue([makeVehicle()]);

    const result = await repo.findWithCursor({ sort: 'newest' } as VehicleFilterDto);

    const arg = findMany.mock.calls[0][0];
    expect(arg.select).not.toHaveProperty('media');
    expect(arg.select).toHaveProperty('primaryImageUrl');
    expect(arg.select).toHaveProperty('thumbnailUrl');

    expect(result.data[0].primaryImageUrl).toBe('https://cdn.example.com/rav4-main.webp');
    expect(result.data[0].thumbnailUrl).toBe('https://cdn.example.com/rav4-thumb.webp');
    expect(result.meta.hasMore).toBe(false);
    expect(result.meta.nextCursor).toBeNull();
  });

  it('builds keyset cursor on price_desc with id tiebreaker', async () => {
    findMany.mockResolvedValue([makeVehicle()]);

    const cursor = encodeCursor({ id: 'v0', v1: 50000 });
    await repo.findWithCursor({ sort: 'price_desc', cursor } as VehicleFilterDto);

    const arg = findMany.mock.calls[0][0];
    expect(arg.orderBy).toEqual([{ price: 'desc' }, { id: 'desc' }]);
    expect(arg.where.OR).toEqual([
      { price: { lt: 50000 } },
      { price: 50000, id: { lt: 'v0' } },
    ]);
    expect(arg.take).toBe(21);
  });

  it('maps withMedia filter to the denormalized column', async () => {
    findMany.mockResolvedValue([makeVehicle()]);

    await repo.findWithCursor({ sort: 'newest', withMedia: true } as VehicleFilterDto);

    const arg = findMany.mock.calls[0][0];
    expect(arg.where.primaryImageUrl).toEqual({ not: null });
  });

  it('emits a nextCursor when more rows than the page size exist', async () => {
    const rows = Array.from({ length: 21 }, (_, i) =>
      makeVehicle({
        id: `v${i}`,
        price: 45000 - i,
        slug: `vehicle-${i}`,
      }),
    );
    findMany.mockResolvedValue(rows);

    const result = await repo.findWithCursor({ sort: 'price_desc' } as VehicleFilterDto);

    expect(result.data).toHaveLength(20);
    expect(result.meta.hasMore).toBe(true);
    expect(result.meta.nextCursor).toBeTruthy();
  });
});