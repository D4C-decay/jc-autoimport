import 'reflect-metadata';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { VehiclesService } from '../domain/vehicles.service.js';
import { CreateVehicleDto } from './dto/create-vehicle.dto.js';
import { VehicleFilterDto } from './dto/vehicle-filter.dto.js';
import { CurrentUser } from '../../../common/decorators/current-user.decorator.js';
import { Public } from '../../../common/decorators/public.decorator.js';
import { Roles } from '../../../common/decorators/roles.decorator.js';
import { CacheTTL } from '../../../common/decorators/cache.decorator.js';
import { UseInterceptors } from '@nestjs/common';
import { RedisCacheInterceptor } from '../../../common/interceptors/redis-cache.interceptor.js';
import type { VehicleStatus } from '../../../../generated/prisma/client.js';

@ApiTags('vehicles')
@Controller('api/v1/vehicles')
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Public()
  @Get()
  @UseInterceptors(RedisCacheInterceptor)
  @CacheTTL({ ttl: 60, keyPrefix: 'catalog' })
  @ApiOperation({ summary: 'List vehicles with filters and cursor pagination' })
  @ApiQuery({ name: 'cursor', required: false })
  list(@Query() filter: VehicleFilterDto) {
    return this.vehiclesService.list(filter);
  }

  @Public()
  @Get('featured')
  @UseInterceptors(RedisCacheInterceptor)
  @CacheTTL({ ttl: 60, keyPrefix: 'featured' })
  @ApiOperation({ summary: 'List featured available vehicles' })
  featured(@Query('limit') limit?: number) {
    return this.vehiclesService.getFeatured(limit ?? 8);
  }

  @Public()
  @Get(':slug')
  @UseInterceptors()
  @ApiOperation({ summary: 'Get vehicle details by slug' })
  getBySlug(@Param('slug') slug: string) {
    return this.vehiclesService.getBySlug(slug, { incrementViews: false });
  }

  @Get(':id/detail')
  @ApiOperation({ summary: 'Get vehicle details by id (authenticated)' })
  getById(@Param('id') id: string) {
    return this.vehiclesService.getById(id);
  }

  @Post()
  @Roles('ADMIN', 'MANAGER', 'SELLER')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a vehicle (admin/manager/seller)' })
  create(
    @Body() dto: CreateVehicleDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.vehiclesService.create(dto, userId);
  }

  @Patch(':id')
  @Roles('ADMIN', 'MANAGER', 'SELLER')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a vehicle' })
  update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateVehicleDto>,
    @CurrentUser('sub') userId: string,
  ) {
    return this.vehiclesService.update(id, dto, userId);
  }

  @Patch(':id/status')
  @Roles('ADMIN', 'MANAGER', 'SELLER')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a vehicle status' })
  updateStatus(
    @Param('id') id: string,
    @Body() body: { status: VehicleStatus },
    @CurrentUser('sub') userId: string,
  ) {
    return this.vehiclesService.updateStatus(id, body.status, userId);
  }

  @Delete(':id')
  @Roles('ADMIN', 'MANAGER')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a vehicle (admin/manager)' })
  remove(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.vehiclesService.remove(id, userId);
  }
}
