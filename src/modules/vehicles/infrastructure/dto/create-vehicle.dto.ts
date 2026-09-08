import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import {
  BodyType,
  DriveType,
  FuelType,
  TransmissionType,
  VehicleStatus,
} from '../../../../../generated/prisma/client.js';

export class MediaItemDto {
  @ApiProperty({ enum: ['IMAGE', 'VIDEO', 'THREE_D_MODEL'] })
  @IsEnum(['IMAGE', 'VIDEO', 'THREE_D_MODEL'])
  type!: 'IMAGE' | 'VIDEO' | 'THREE_D_MODEL';

  @ApiProperty()
  @IsUrl({ protocols: ['https', 'http'] })
  url!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  altText?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  sortOrder?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;
}

export class SpecificationItemDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty()
  @IsString()
  category!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  value?: string;
}

export class CreateVehicleDto {
  @ApiProperty()
  @IsString()
  @Min(17)
  @Max(17)
  vin!: string;

  @ApiProperty({ example: 'Toyota' })
  @IsString()
  @IsNotEmpty()
  brand!: string;

  @ApiProperty({ example: 'Corolla' })
  @IsString()
  @IsNotEmpty()
  model!: string;

  @ApiProperty({ example: 2023 })
  @IsInt()
  @Min(1900)
  @Max(2100)
  year!: number;

  @ApiProperty({ enum: TransmissionType })
  @IsEnum(TransmissionType)
  transmission!: TransmissionType;

  @ApiProperty({ enum: DriveType })
  @IsEnum(DriveType)
  driveType!: DriveType;

  @ApiProperty({ enum: FuelType })
  @IsEnum(FuelType)
  fuelType!: FuelType;

  @ApiProperty({ enum: BodyType })
  @IsEnum(BodyType)
  bodyType!: BodyType;

  @ApiProperty({ example: 2.0 })
  @Type(() => Number)
  @IsInt()
  engineSize!: number;

  @ApiProperty({ example: 170 })
  @IsInt()
  @Min(1)
  horsepower!: number;

  @ApiProperty({ example: 25000 })
  @IsInt()
  @Min(0)
  mileage!: number;

  @ApiProperty({ example: 24500 })
  @Type(() => Number)
  price!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  originalPrice?: number;

  @ApiPropertyOptional({ default: 'USD' })
  @IsOptional()
  @IsString()
  currency?: string = 'USD';

  @ApiProperty({ example: 'Negro' })
  @IsString()
  @IsNotEmpty()
  color!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  interiorColor?: string;

  @ApiPropertyOptional({ default: 4 })
  @IsOptional()
  @IsInt()
  @Min(1)
  doors?: number = 4;

  @ApiPropertyOptional({ default: 5 })
  @IsOptional()
  @IsInt()
  @Min(1)
  seats?: number = 5;

  @ApiPropertyOptional({ enum: VehicleStatus, default: 'AVAILABLE' })
  @IsOptional()
  @IsEnum(VehicleStatus)
  status?: VehicleStatus = 'AVAILABLE';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean = false;

  @ApiPropertyOptional({ example: 'Japon' })
  @IsOptional()
  @IsString()
  countryOfOrigin?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Date)
  importDate?: Date;

  @ApiPropertyOptional({ example: 'Puerto de Balboa' })
  @IsOptional()
  @IsString()
  portOfEntry?: string;

  @ApiPropertyOptional({ description: 'Flexible JSON with feature flags/values' })
  @IsOptional()
  features?: Record<string, unknown>;

  @ApiPropertyOptional()
  @IsOptional()
  publishedAt?: Date;

  @ApiPropertyOptional({ type: [MediaItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MediaItemDto)
  media?: MediaItemDto[];

  @ApiPropertyOptional({ type: [SpecificationItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SpecificationItemDto)
  specifications?: SpecificationItemDto[];
}
