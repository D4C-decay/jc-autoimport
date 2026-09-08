import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import {
  BodyType,
  DriveType,
  FuelType,
  TransmissionType,
  VehicleStatus,
} from '../../../../../generated/prisma/client.js';

export class VehicleFilterDto {
  @ApiPropertyOptional({ description: 'Cursor for next page (opaque)' })
  @IsOptional()
  @IsString()
  cursor?: string;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  model?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  yearMin?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  yearMax?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  priceMin?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  priceMax?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  mileageMax?: number;

  @ApiPropertyOptional({ enum: FuelType })
  @IsOptional()
  @IsEnum(FuelType)
  fuelType?: FuelType;

  @ApiPropertyOptional({ enum: BodyType })
  @IsOptional()
  @IsEnum(BodyType)
  bodyType?: BodyType;

  @ApiPropertyOptional({ enum: TransmissionType })
  @IsOptional()
  @IsEnum(TransmissionType)
  transmission?: TransmissionType;

  @ApiPropertyOptional({ enum: DriveType })
  @IsOptional()
  @IsEnum(DriveType)
  driveType?: DriveType;

  @ApiPropertyOptional({ enum: VehicleStatus, default: 'AVAILABLE' })
  @IsOptional()
  @IsEnum(VehicleStatus)
  status?: VehicleStatus;

  @ApiPropertyOptional({
    enum: ['price_asc', 'price_desc', 'year_desc', 'year_asc', 'mileage_asc', 'mileage_desc', 'newest', 'oldest'],
    default: 'newest',
  })
  @IsOptional()
  @IsString()
  sort?: 'price_asc' | 'price_desc' | 'year_desc' | 'year_asc' | 'mileage_asc' | 'mileage_desc' | 'newest' | 'oldest' = 'newest';

  @ApiPropertyOptional({ description: 'Only include vehicles with at least one media' })
  @IsOptional()
  @Type(() => Boolean)
  withMedia?: boolean;
}

export class CreateVehicleBodyDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  priceMin?: number;
}
