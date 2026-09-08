import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';

export class CreateReservationDto {
  @ApiProperty({ description: 'Vehicle to reserve' })
  @IsString()
  @IsNotEmpty()
  vehicleId!: string;

  @ApiProperty({
    description: 'Deposit amount to hold the vehicle (must be >= 0)',
    example: 500,
  })
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  depositAmount!: number;

  @ApiPropertyOptional({ description: 'Currency, e.g. USD' })
  @IsOptional()
  @IsString()
  currency?: string = 'USD';
}

export class CreateCheckoutDto {
  @ApiProperty({ description: 'Reservation id created first' })
  @IsString()
  @IsNotEmpty()
  reservationId!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  successUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  cancelUrl?: string;
}

export class CancelReservationDto {
  @ApiPropertyOptional({ description: 'Reason for cancelling the reservation' })
  @IsOptional()
  @IsString()
  reason?: string;
}

export class StripeWebhookDto {}

export class CreatePaymentDto {
  @ApiProperty({ description: 'Reservation id' })
  @IsString()
  reservationId!: string;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  amount!: number;

  @ApiPropertyOptional({ default: 'USD' })
  @IsOptional()
  @IsString()
  currency?: string = 'USD';
}