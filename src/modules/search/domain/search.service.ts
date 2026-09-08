import 'reflect-metadata';
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../core/database/prisma.service.js';
import { RedisService } from '../../../core/redis/redis.service.js';
import { Prisma } from '../../../../generated/prisma/client.js';
import type { BodyType, FuelType } from '../../../../generated/prisma/client.js';
import { decodeCursor, encodeCursor } from '../../../shared/utils/cursor-encoder.js';

@Injectable()
export class SearchService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async search(params: {
    query: string;
    cursor?: string;
    limit?: number;
  }): Promise<SearchResponse> {
    const query = params.query.trim();
    if (!query) {
      return { data: [], meta: { hasMore: false, nextCursor: null, prevCursor: null } };
    }

    const limit = Math.min(params.limit ?? 20, 100);
    const cacheKey = `search:${query.toLowerCase()}:${params.cursor ?? 'first'}:${limit}`;

    const cached = await this.redis.get<SearchResponse>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    const result = await this.executeSearch(query, params.cursor, limit);

    await this.redis.set(cacheKey, result, 30);
    return result;
  }

  async suggestions(prefix: string, limit = 8): Promise<SuggestionItem[]> {
    const safeLimit = Math.min(limit, 20);
    const cacheKey = `suggest:${prefix.toLowerCase()}:${safeLimit}`;

    const cached = await this.redis.get<SuggestionItem[]>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    const suggestions = await this.prisma.vehicle.findMany({
      where: {
        OR: [
          { brand: { contains: prefix, mode: 'insensitive' } },
          { model: { contains: prefix, mode: 'insensitive' } },
        ],
        status: 'AVAILABLE',
      },
      select: {
        brand: true,
        model: true,
        year: true,
        slug: true,
      },
      orderBy: { brand: 'asc' },
      take: safeLimit,
    });

    const deduplicated = suggestions.filter(
      (s, index, self) =>
        index === self.findIndex((t) => t.brand === s.brand && t.model === s.model),
    );

    const result = deduplicated.map((s) => ({
      brand: s.brand,
      model: s.model,
      full: `${s.brand} ${s.model}`,
    }));

    await this.redis.set(cacheKey, result, 300);
    return result;
  }

  async facets(filter: {
    brand?: string;
    fuelType?: string;
    bodyType?: string;
  }): Promise<FacetsResponse> {
    const cacheKey = `facets:${JSON.stringify(filter)}`;
    const cached = await this.redis.get<FacetsResponse>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    const where: Prisma.VehicleWhereInput = { status: 'AVAILABLE' };
    if (filter.brand) where.brand = filter.brand;
    if (filter.fuelType) where.fuelType = filter.fuelType as FuelType;
    if (filter.bodyType) where.bodyType = filter.bodyType as BodyType;

    const [brands, fuelTypes, bodyTypes, priceRange, yearRange, transmissions, driveTypes] =
      await this.prisma.$transaction([
        this.prisma.vehicle.groupBy({
          by: ['brand'],
          where,
          _count: { _all: true },
          orderBy: { brand: 'asc' },
        }),
        this.prisma.vehicle.groupBy({
          by: ['fuelType'],
          where,
          _count: { _all: true },
        }),
        this.prisma.vehicle.groupBy({
          by: ['bodyType'],
          where,
          _count: { _all: true },
        }),
        this.prisma.vehicle.aggregate({
          where,
          _min: { price: true },
          _max: { price: true },
        }),
        this.prisma.vehicle.aggregate({
          where,
          _min: { year: true },
          _max: { year: true },
        }),
        this.prisma.vehicle.groupBy({
          by: ['transmission'],
          where,
          _count: { _all: true },
        }),
        this.prisma.vehicle.groupBy({
          by: ['driveType'],
          where,
          _count: { _all: true },
        }),
      ]);

    const result: FacetsResponse = {
      brands: brands.map((b) => ({ value: b.brand, count: b._count._all })),
      fuelTypes: fuelTypes.map((f) => ({ value: f.fuelType, count: f._count._all })),
      bodyTypes: bodyTypes.map((b) => ({ value: b.bodyType, count: b._count._all })),
      transmissions: transmissions.map((t) => ({ value: t.transmission, count: t._count._all })),
      driveTypes: driveTypes.map((d) => ({ value: d.driveType, count: d._count._all })),
      priceRange: {
        min: priceRange._min.price ? Number(priceRange._min.price) : null,
        max: priceRange._max.price ? Number(priceRange._max.price) : null,
      },
      yearRange: {
        min: yearRange._min.year,
        max: yearRange._max.year,
      },
    };

    await this.redis.set(cacheKey, result, 300);
    return result;
  }

  private async executeSearch(
    query: string,
    cursor: string | undefined,
    limit: number,
  ): Promise<SearchResponse> {
    let seek: { rank: number; id: string } | null = null;
    if (cursor) {
      try {
        seek = decodeCursor(cursor);
      } catch {
        throw new NotFoundException('Invalid cursor');
      }
    }

    const queryTs = () => Prisma.sql`plainto_tsquery('spanish', ${query})`;

    const rows = await this.prisma.$queryRaw<SearchRow[]>(Prisma.sql`
      WITH ranked AS (
        SELECT
          v.id,
          v.brand,
          v.model,
          v.year,
          v.slug,
          v.price,
          v.mileage,
          v.fuel_type,
          v.body_type,
          v.transmission,
          v.drive_type,
          v.horsepower,
          v.color,
          v.created_at,
          ROUND((ts_rank_cd(v.search_vector, ${queryTs()}))::numeric * 1000000)::int AS rank,
          v.primary_image_url AS primary_image
        FROM vehicles v
        WHERE v.search_vector @@ ${queryTs()}
          AND v.status = 'AVAILABLE'
      )
      SELECT * FROM ranked
      ${
        seek
          ? Prisma.sql`WHERE (rank, id) < (${seek.rank}, ${seek.id})`
          : Prisma.empty
      }
      ORDER BY rank DESC, id DESC
      LIMIT ${limit + 1}
    `);

    const hasMore = rows.length > limit;
    const data = rows.slice(0, limit);
    const last = data.length > 0 ? data[data.length - 1] : null;

    return {
      data: data.map((r) => ({
        id: r.id,
        brand: r.brand,
        model: r.model,
        year: r.year,
        slug: r.slug,
        price: Number(r.price),
        mileage: r.mileage,
        fuelType: r.fuel_type,
        bodyType: r.body_type,
        transmission: r.transmission,
        driveType: r.drive_type,
        horsepower: r.horsepower,
        color: r.color,
        primaryImage: r.primary_image,
      })),
      meta: {
        hasMore,
        nextCursor:
          hasMore && last ? encodeCursor({ rank: last.rank, id: last.id }) : null,
        prevCursor: null,
      },
    };
  }
}

export interface SearchResponse {
  data: SearchResult[];
  meta: {
    hasMore: boolean;
    nextCursor: string | null;
    prevCursor: string | null;
  };
}

export interface SearchResult {
  id: string;
  brand: string;
  model: string;
  year: number;
  slug: string;
  price: number;
  mileage: number;
  fuelType: string;
  bodyType: string;
  transmission: string;
  driveType: string;
  horsepower: number;
  color: string;
  primaryImage: string | null;
}

export interface SuggestionItem {
  brand: string;
  model: string;
  full: string;
}

export interface FacetsResponse {
  brands: Array<{ value: string; count: number }>;
  fuelTypes: Array<{ value: string; count: number }>;
  bodyTypes: Array<{ value: string; count: number }>;
  transmissions: Array<{ value: string; count: number }>;
  driveTypes: Array<{ value: string; count: number }>;
  priceRange: { min: number | null; max: number | null };
  yearRange: { min: number | null; max: number | null };
}

interface SearchRow {
  id: string;
  brand: string;
  model: string;
  year: number;
  slug: string;
  price: string;
  mileage: number;
  fuel_type: string;
  body_type: string;
  transmission: string;
  drive_type: string;
  horsepower: number;
  color: string;
  rank: number;
  primary_image: string | null;
}