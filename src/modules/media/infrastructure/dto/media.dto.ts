import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateMediaDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  altText?: string;

  @ApiPropertyOptional()
  @IsOptional()
  sortOrder?: number;

  @ApiPropertyOptional()
  @IsOptional()
  isPrimary?: boolean;
}

export class PresignedUploadDto {
  @ApiProperty({ example: 'image/webp' })
  @IsString()
  contentType!: string;

  @ApiProperty({ example: 'toyota-corolla.jpg' })
  @IsString()
  filename!: string;
}

export class ReorderMediaDto {
  @ApiProperty({ type: [String] })
  orderedIds!: string[];
}