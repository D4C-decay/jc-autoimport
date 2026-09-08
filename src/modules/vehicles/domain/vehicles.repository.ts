import 'reflect-metadata';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/database/prisma.service.js';
import {
  encodeCursor,
  decodeCursor,
  type CursorData,
} from '../../../shared/utils/cursor-encoder.js';
import type { VehicleFilterDto } from '../infrastructure/dto/vehicle-filter.dto.js';

export interface CursorPaginationResult<T> {
  data: T[];
  meta: {
    nextCursor: string | null;
    prevCursor: string | null;
    hasMore: boolean;
  };
}

export interface VehicleSummary {
  id: string;
  slug: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  fuelType: string;
  bodyType: string;
  transmission: string;
  driveType: string;
  horsepower: number;
  color: string;
  status: string;
  isFeatured: boolean;
  primaryImageUrl: string | null;
  thumbnailUrl: string | null;
  createdAt: Date;
}

const summarySelect = {
  id: true,
  slug: true,
  brand: true,
  model: true,
  year: true,
  price: true,
  mileage: true,
  fuelType: true,
  bodyType: true,
  transmission: true,
  driveType: true,
  horsepower: true,
  color: true,
  status: true,
  isFeatured: true,
  createdAt: true,
  primaryImageUrl: true,
  thumbnailUrl: true,
} as const;

const SORT_CONFIG = {
  price_asc: 'price_asc',
  price_desc: 'price_desc',
  year_desc: 'year_desc',
  year_asc: 'year_asc',
  mileage_asc: 'mileage_asc',
  mileage_desc: 'mileage_desc',
  newest: 'newest',
  oldest: 'oldest',
} as const;

type SortKey = keyof typeof SORT_CONFIG;

@Injectable()
export class VehiclesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findWithCursor(
    filter: VehicleFilterDto,
  ): Promise<CursorPaginationResult<VehicleSummary>> {
    const limit = filter.limit ?? 20;
    const sort = (filter.sort ?? 'newest') as SortKey;
    const orderBy = this.buildOrderBy(sort);

    const where = this.buildWhere(filter);
    const cursor = filter.cursor ? decodeCursor(filter.cursor) : null;

    const take = limit + 1;

    // Keyset pagination using the sort column(s) + id tiebreaker
    const data = await this.prisma.vehicle.findMany({
      select: summarySelect,
      where: cursor ? { ...where, ...this.buildCursorWhere(sort, cursor) } : where,
      orderBy,
      take,
    });

    const hasMore = data.length > limit;
    const pageData = hasMore ? data.slice(0, limit) : data;

    const transformed = pageData.map((item) => ({
      id: item.id,
      slug: item.slug,
      brand: item.brand,
      model: item.model,
      year: item.year,
      price: Number(item.price),
      mileage: item.mileage,
      fuelType: item.fuelType,
      bodyType: item.bodyType,
      transmission: item.transmission,
      driveType: item.driveType,
      horsepower: item.horsepower,
      color: item.color,
      status: item.status,
      isFeatured: item.isFeatured,
      createdAt: item.createdAt,
      primaryImageUrl: item.primaryImageUrl,
      thumbnailUrl: item.thumbnailUrl,
    }));

    const lastItem = transformed.length > 0 ? transformed[transformed.length - 1] : null;
    const firstItem = transformed.length > 0 ? transformed[0] : null;

    const nextCursor =
      hasMore && lastItem ? encodeCursor(this.buildCursorPayload(sort, lastItem)) : null;
    const prevCursor =
      firstItem && !filter.cursor ? null : firstItem ? encodeCursor(this.buildCursorPayload(sort, firstItem)) : null;

    return {
      data: transformed,
      meta: {
        nextCursor,
        prevCursor,
        hasMore,
      },
    };
  }

  async findById(id: string) {
    return this.prisma.vehicle.findUnique({
      where: { id },
      include: {
        media: { orderBy: { sortOrder: 'asc' } },
        specifications: { include: { specification: true } },
        reviews: { where: { isActive: true }, take: 20 },
      },
    });
  }

  async findBySlug(slug: string) {
    return this.prisma.vehicle.findUnique({
      where: { slug },
      include: {
        media: { orderBy: { sortOrder: 'asc' } },
        specifications: { include: { specification: true } },
        reviews: { where: { isActive: true }, take: 20 },
        leads: { take: 10, orderBy: { createdAt: 'desc' } },
      },
    });
  }

  async incrementViews(id: string): Promise<void> {
    await this.prisma.vehicle.update({
      where: { id },
      data: { viewsCount: { increment: 1 } },
    });
  }

  private buildWhere(filter: VehicleFilterDto): Record<string, unknown> {
    const where: Record<string, unknown> = {};

    if (filter.status) where.status = filter.status;
    if (filter.brand) where.brand = { equals: filter.brand, mode: 'insensitive' };
    if (filter.model) where.model = { equals: filter.model, mode: 'insensitive' };
    if (filter.yearMin || filter.yearMax) {
      where.year = {
        ...(filter.yearMin ? { gte: filter.yearMin } : {}),
        ...(filter.yearMax ? { lte: filter.yearMax } : {}),
      };
    }
    if (filter.priceMin !== undefined || filter.priceMax !== undefined) {
      where.price = {
        ...(filter.priceMin !== undefined ? { gte: filter.priceMin } : {}),
        ...(filter.priceMax !== undefined ? { lte: filter.priceMax } : {}),
      };
    }
    if (filter.mileageMax !== undefined) {
      where.mileage = { lte: filter.mileageMax };
    }
    if (filter.fuelType) where.fuelType = filter.fuelType;
    if (filter.bodyType) where.bodyType = filter.bodyType;
    if (filter.transmission) where.transmission = filter.transmission;
    if (filter.driveType) where.driveType = filter.driveType;
    if (filter.withMedia) {
      where.primaryImageUrl = { not: null };
    }

    return where;
  }

  private buildOrderBy(sort: SortKey) {
    switch (sort) {
      case 'price_asc':
        return [{ price: 'asc' as const }, { id: 'asc' as const }];
      case 'price_desc':
        return [{ price: 'desc' as const }, { id: 'desc' as const }];
      case 'year_desc':
        return [{ year: 'desc' as const }, { id: 'desc' as const }];
      case 'year_asc':
        return [{ year: 'asc' as const }, { id: 'asc' as const }];
      case 'mileage_asc':
        return [{ mileage: 'asc' as const }, { id: 'asc' as const }];
      case 'mileage_desc':
        return [{ mileage: 'desc' as const }, { id: 'desc' as const }];
      case 'oldest':
        return [{ createdAt: 'asc' as const }, { id: 'asc' as const }];
      case 'newest':
      default:
        return [{ createdAt: 'desc' as const }, { id: 'desc' as const }];
    }
  }

  private buildCursorWhere(sort: SortKey, cursor: Record<string, unknown>): Record<string, unknown> {
    const id = cursor.id as string;
    if (!id) return {};

    switch (sort) {
      case 'price_asc': {
        const price = cursor.v1 as number;
        return { OR: [{ price: { gt: price } }, { price, id: { gt: id } }] };
      }
      case 'price_desc': {
        const price = cursor.v1 as number;
        return { OR: [{ price: { lt: price } }, { price, id: { lt: id } }] };
      }
      case 'year_desc': {
        const year = cursor.v1 as number;
        return { OR: [{ year: { lt: year } }, { year, id: { lt: id } }] };
      }
      case 'year_asc': {
        const year = cursor.v1 as number;
        return { OR: [{ year: { gt: year } }, { year, id: { gt: id } }] };
      }
      case 'mileage_asc': {
        const mileage = cursor.v1 as number;
        return { OR: [{ mileage: { gt: mileage } }, { mileage, id: { gt: id } }] };
      }
      case 'mileage_desc': {
        const mileage = cursor.v1 as number;
        return { OR: [{ mileage: { lt: mileage } }, { mileage, id: { lt: id } }] };
      }
      case 'oldest': {
        const createdAt = cursor.v1 as string;
        return { OR: [{ createdAt: { gt: createdAt } }, { createdAt, id: { gt: id } }] };
      }
      case 'newest':
      default: {
        const createdAt = cursor.v1 as string;
        return { OR: [{ createdAt: { lt: createdAt } }, { createdAt, id: { lt: id } }] };
      }
    }
  }

  private buildCursorPayload(
    sort: SortKey,
    item: { id: string; price: number; year: number; mileage: number; createdAt: Date },
  ): CursorData {
    const base: CursorData = { id: item.id };
    switch (sort) {
      case 'price_asc':
      case 'price_desc':
        base.v1 = item.price;
        break;
      case 'year_desc':
      case 'year_asc':
        base.v1 = item.year;
        break;
      case 'mileage_asc':
      case 'mileage_desc':
        base.v1 = item.mileage;
        break;
      case 'oldest':
      case 'newest':
      default:
        base.v1 = item.createdAt.toISOString();
        break;
    }
    return base;
  }
}
