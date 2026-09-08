import 'reflect-metadata';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../../core/database/prisma.service.js';
import { RedisService } from '../../../core/redis/redis.service.js';
import { VehiclesRepository } from './vehicles.repository.js';
import { CreateVehicleDto } from '../infrastructure/dto/create-vehicle.dto.js';
import { VehicleFilterDto } from '../infrastructure/dto/vehicle-filter.dto.js';
import {
  generateVehicleSlug,
} from '../../../shared/utils/slugify.js';
import type { VehicleStatus } from '../../../../generated/prisma/client.js';

@Injectable()
export class VehiclesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly repository: VehiclesRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async list(filter: VehicleFilterDto) {
    return this.repository.findWithCursor(filter);
  }

  async getBySlug(slug: string, options: { incrementViews?: boolean } = {}) {
    const vehicle = await this.repository.findBySlug(slug);
    if (!vehicle || vehicle.status === 'SOLD') {
      throw new NotFoundException('Vehicle not found');
    }

    if (options.incrementViews) {
      await this.repository.incrementViews(vehicle.id);
    }

    return vehicle;
  }

  async getById(id: string) {
    const vehicle = await this.repository.findById(id);
    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }
    return vehicle;
  }

  async create(dto: CreateVehicleDto, userId: string) {
    const existingVin = await this.prisma.vehicle.findUnique({
      where: { vin: dto.vin },
    });
    if (existingVin) {
      throw new ConflictException('A vehicle with this VIN already exists');
    }

    const slug = generateVehicleSlug(dto.brand, dto.model, dto.year, dto.vin);

    const vehicle = await this.prisma.vehicle.create({
      data: {
        vin: dto.vin,
        slug,
        brand: dto.brand,
        model: dto.model,
        year: dto.year,
        transmission: dto.transmission,
        driveType: dto.driveType,
        fuelType: dto.fuelType,
        bodyType: dto.bodyType,
        engineSize: dto.engineSize.toString(),
        horsepower: dto.horsepower,
        mileage: dto.mileage,
        price: dto.price.toString(),
        ...(dto.originalPrice ? { originalPrice: dto.originalPrice.toString() } : {}),
        currency: dto.currency ?? 'USD',
        color: dto.color,
        ...(dto.interiorColor ? { interiorColor: dto.interiorColor } : {}),
        doors: dto.doors ?? 4,
        seats: dto.seats ?? 5,
        status: dto.status ?? 'AVAILABLE',
        ...(dto.description ? { description: dto.description } : {}),
        isFeatured: dto.isFeatured ?? false,
        ...(dto.countryOfOrigin ? { countryOfOrigin: dto.countryOfOrigin } : {}),
        ...(dto.importDate ? { importDate: dto.importDate } : {}),
        ...(dto.portOfEntry ? { portOfEntry: dto.portOfEntry } : {}),
        ...(dto.features ? { features: dto.features as object } : {}),
        publishedAt: dto.publishedAt ?? new Date(),

        media: dto.media?.length
          ? {
              create: dto.media.map((m, index) => ({
                type: m.type,
                url: m.url,
                altText: m.altText,
                sortOrder: m.sortOrder ?? index,
                isPrimary: m.isPrimary ?? (index === 0),
              })),
            }
          : undefined,

        specifications: dto.specifications?.length
          ? {
              create: await this.createSpecifications(dto.specifications),
            }
          : undefined,
      },
      include: { media: true, specifications: { include: { specification: true } } },
    });

    await this.invalidateCatalogCache();
    this.eventEmitter.emit('vehicle.created', {
      actorId: userId,
      vehicleId: vehicle.id,
      payload: { brand: vehicle.brand, model: vehicle.model, vin: vehicle.vin },
    });

    return vehicle;
  }

  async update(id: string, dto: Partial<CreateVehicleDto>, userId: string) {
    const existing = await this.prisma.vehicle.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Vehicle not found');
    }

    if (dto.vin && dto.vin !== existing.vin) {
      const vinConflict = await this.prisma.vehicle.findUnique({
        where: { vin: dto.vin },
      });
      if (vinConflict) {
        throw new ConflictException('A vehicle with this VIN already exists');
      }
    }

    const vehicle = await this.prisma.vehicle.update({
      where: { id },
      data: {
        ...(dto.vin ? { vin: dto.vin } : {}),
        ...(dto.brand ? { brand: dto.brand } : {}),
        ...(dto.model ? { model: dto.model } : {}),
        ...(dto.year ? { year: dto.year } : {}),
        ...(dto.transmission ? { transmission: dto.transmission } : {}),
        ...(dto.driveType ? { driveType: dto.driveType } : {}),
        ...(dto.fuelType ? { fuelType: dto.fuelType } : {}),
        ...(dto.bodyType ? { bodyType: dto.bodyType } : {}),
        ...(dto.engineSize ? { engineSize: dto.engineSize.toString() } : {}),
        ...(dto.horsepower ? { horsepower: dto.horsepower } : {}),
        ...(dto.mileage !== undefined ? { mileage: dto.mileage } : {}),
        ...(dto.price ? { price: dto.price.toString() } : {}),
        ...(dto.originalPrice !== undefined ? { originalPrice: dto.originalPrice?.toString() } : {}),
        ...(dto.currency ? { currency: dto.currency } : {}),
        ...(dto.color ? { color: dto.color } : {}),
        ...(dto.interiorColor !== undefined ? { interiorColor: dto.interiorColor } : {}),
        ...(dto.doors ? { doors: dto.doors } : {}),
        ...(dto.seats ? { seats: dto.seats } : {}),
        ...(dto.status ? { status: dto.status } : {}),
        ...(dto.description !== undefined ? { description: dto.description } : {}),
        ...(dto.isFeatured !== undefined ? { isFeatured: dto.isFeatured } : {}),
        ...(dto.countryOfOrigin !== undefined ? { countryOfOrigin: dto.countryOfOrigin } : {}),
        ...(dto.importDate !== undefined ? { importDate: dto.importDate } : {}),
        ...(dto.portOfEntry !== undefined ? { portOfEntry: dto.portOfEntry } : {}),
        ...(dto.features ? { features: dto.features as object } : {}),
      },
      include: { media: true },
    });

    await this.invalidateCatalogCache();
    await this.invalidateVehicleCache(id);

    this.eventEmitter.emit('vehicle.updated', {
      actorId: userId,
      vehicleId: id,
      payload: { brand: vehicle.brand, model: vehicle.model },
    });

    return vehicle;
  }

  async updateStatus(id: string, status: VehicleStatus, userId: string) {
    const existing = await this.prisma.vehicle.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Vehicle not found');
    }

    const vehicle = await this.prisma.vehicle.update({
      where: { id },
      data: { status },
    });

    await this.invalidateCatalogCache();
    await this.invalidateVehicleCache(id);

    this.eventEmitter.emit('vehicle.statusChanged', {
      actorId: userId,
      vehicleId: id,
      payload: { previous: existing.status, current: status },
    });

    return vehicle;
  }

  async remove(id: string, userId: string) {
    const existing = await this.prisma.vehicle.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Vehicle not found');
    }

    // Soft delete: only sold or unpublished are fully deletable in production.
    // For this implementation we perform a hard delete since audit log tracks it.
    await this.prisma.vehicle.delete({ where: { id } });

    await this.invalidateCatalogCache();
    await this.redis.delete(`vehicle:${existing.slug}`);

    this.eventEmitter.emit('vehicle.deleted', {
      actorId: userId,
      vehicleId: id,
      payload: { brand: existing.brand, model: existing.model, vin: existing.vin },
    });

    return { success: true, deletedId: id };
  }

  async getFeatured(limit = 8) {
    return this.prisma.vehicle.findMany({
      where: {
        isFeatured: true,
        status: 'AVAILABLE',
        ...(limit ? {} : {}),
      },
      select: {
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
        media: {
          where: { isPrimary: true },
          select: { url: true, thumbnailUrl: true },
          take: 1,
        },
      },
      orderBy: { publishedAt: 'desc' },
      take: Math.min(limit, 24),
    });
  }

  async findSellers() {
    return this.prisma.user.findMany({
      where: { role: 'SELLER', isActive: true },
      select: { id: true, firstName: true, lastName: true, email: true, phone: true },
    });
  }

  private async createSpecifications(
    specs: Array<{ name: string; category: string; value?: string }>,
  ) {
    const result: Array<{ specification: { connect: { id: string } }; value?: string }> = [];

    for (const spec of specs) {
      let specification = await this.prisma.specification.findUnique({
        where: { name: spec.name },
      });
      if (!specification) {
        specification = await this.prisma.specification.create({
          data: { name: spec.name, category: spec.category },
        });
      }
      result.push({
        specification: { connect: { id: specification.id } },
        ...(spec.value ? { value: spec.value } : {}),
      });
    }
    return result;
  }

  private async invalidateCatalogCache(): Promise<void> {
    await this.redis.deleteByPattern('catalog:*');
    await this.redis.deleteByPattern('featured:*');
    await this.redis.deleteByPattern('search:*');
    await this.redis.deleteByPattern('facets:*');
  }

  private async invalidateVehicleCache(id: string): Promise<void> {
    await this.redis.delete(`vehicle:${id}`);
  }
}
