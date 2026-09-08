import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEmail,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { LeadStatus, LeadType } from '../../../../../generated/prisma/client.js';

export class CreateLeadDto {
  @ApiPropertyOptional({ description: 'Vehicle id being inquired about' })
  @IsOptional()
  @IsString()
  vehicleId?: string;

  @ApiProperty({ example: 'Maria Rodriguez' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  customerName!: string;

  @ApiProperty({ example: 'maria@example.com' })
  @IsEmail()
  customerEmail!: string;

  @ApiPropertyOptional({ example: '+584121234567' })
  @IsOptional()
  @IsString()
  customerPhone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  message?: string;

  @ApiProperty({ enum: LeadType })
  @IsEnum(LeadType)
  leadType!: LeadType;

  @ApiPropertyOptional({ description: 'Scheduled test drive time' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  scheduledAt?: Date;

  @ApiPropertyOptional({ example: 'web_form' })
  @IsOptional()
  @IsString()
  source?: string;
}

export class UpdateLeadDto {
  @ApiPropertyOptional({ enum: LeadStatus })
  @IsOptional()
  @IsEnum(LeadStatus)
  status?: LeadStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  scheduledAt?: Date;
}

export class AssignLeadDto {
  @ApiProperty()
  @IsString()
  sellerId!: string;
}

export class LeadQueryDto {
  @ApiPropertyOptional({ enum: LeadStatus })
  @IsOptional()
  @IsEnum(LeadStatus)
  status?: LeadStatus;

  @ApiPropertyOptional({ enum: LeadType })
  @IsOptional()
  @IsEnum(LeadType)
  leadType?: LeadType;

  @ApiPropertyOptional({ description: 'Only shows leads assigned to requesting seller' })
  @IsOptional()
  assignedToMe?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 20;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;
}