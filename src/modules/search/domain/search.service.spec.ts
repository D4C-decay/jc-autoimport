import 'reflect-metadata';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SearchService } from './search.service.js';
import type { PrismaService } from '../../../core/database/prisma.service.js';
import type { RedisService } from '../../../core/redis/redis.service.js';

function makeRow(overrides: Record<string, unknown> = {}) {
  return {
    id: 'v1',
    brand: 'Toyota',
    model: 'RAV4',
    year: 2026,
    slug: 'toyota-rav4-2026',
    price: '45000',
    mileage: 10,
    fuel_type: 'HYBRID',
    body_type: 'SUV',
    transmission: 'AUTOMATIC',
    drive_type: '4WD',
    horsepower: 219,
    color: 'Plata',
    created_at: new Date('2026-01-01T00:00:00.000Z'),
    rank: 1000,
    primary_image: 'https://cdn.example.com/rav4-main.webp',
    ...overrides,
  };
}

describe('SearchService', () => {
  let service: SearchService;
  let queryRaw: ReturnType<typeof vi.fn>;
  let redisGet: ReturnType<typeof vi.fn>;
  let redisSet: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    queryRaw = vi.fn();
    redisGet = vi.fn().mockResolvedValue(null);
    redisSet = vi.fn().mockResolvedValue(undefined);

    const prisma = { $queryRaw: queryRaw } as unknown as PrismaService;
    const redis = { get: redisGet, set: redisSet } as unknown as RedisService;
    service = new SearchService(prisma, redis);
  });

  it('returns empty for an empty query without hitting the database', async () => {
    const result = await service.search({ query: '   ' });
    expect(result).toEqual({
      data: [],
      meta: { hasMore: false, nextCursor: null, prevCursor: null },
    });
    expect(queryRaw).not.toHaveBeenCalled();
  });

  it('runs full-text search against the indexed column and maps the denormalized image', async () => {
    queryRaw.mockResolvedValue([makeRow()]);

    const result = await service.search({ query: 'rav4', limit: 2 });

    expect(redisSet).toHaveBeenCalledWith('search:rav4:first:2', result, 30);

    const sql = queryRaw.mock.calls[0][0].sql;
    expect(sql).toContain('v.search_vector');
    expect(sql).toContain('v.primary_image_url');
    expect(sql).not.toMatch(/to_tsvector\(/);
    expect(sql).not.toContain('media m');

    expect(result.data[0].primaryImage).toBe('https://cdn.example.com/rav4-main.webp');
    expect(result.data[0].price).toBe(45000);
    expect(result.meta.hasMore).toBe(false);
  });

  it('serves a cached result without running the query', async () => {
    const cached = { data: [makeRow()] };
    redisGet.mockResolvedValue(cached);

    const result = await service.search({ query: 'rav4' });

    expect(result).toBe(cached);
    expect(queryRaw).not.toHaveBeenCalled();
    expect(redisSet).not.toHaveBeenCalled();
  });

  it('signals hasMore and returns an opaque nextCursor beyond the page', async () => {
    const rows = Array.from({ length: 3 }, (_, i) => makeRow({ id: `v${i}`, rank: 1000 - i }));
    queryRaw.mockResolvedValue(rows);

    const result = await service.search({ query: 'rav4', limit: 2 });

    expect(result.data).toHaveLength(2);
    expect(result.meta.hasMore).toBe(true);
    expect(result.meta.nextCursor).toBeTruthy();
  });
});