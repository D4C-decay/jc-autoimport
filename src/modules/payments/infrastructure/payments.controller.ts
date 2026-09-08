import 'reflect-metadata';
import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  Req,
  BadRequestException,
} from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { PaymentsService } from '../domain/payments.service.js';
import { StripeService } from '../domain/stripe.service.js';
import {
  CancelReservationDto,
  CreateCheckoutDto,
  CreateReservationDto,
} from './dto/payment.dto.js';
import { Public } from '../../../common/decorators/public.decorator.js';
import { CurrentUser } from '../../../common/decorators/current-user.decorator.js';
import type { JwtPayload } from '../../../common/types/index.js';

@ApiTags('payments')
@Controller('api/v1/payments')
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly stripe: StripeService,
  ) {}

  @Public()
  @Post('webhook')
  @ApiOperation({ summary: 'Stripe webhook endpoint' })
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ): Promise<{ received: true }> {
    const rawBody = req.rawBody;
    if (!rawBody || !signature) {
      throw new BadRequestException('Missing payload or signature');
    }

    try {
      const event = await this.stripe.constructWebhookEvent(
        rawBody,
        signature,
      );
      await this.paymentsService.handleStripeEvent(event);
      return { received: true };
    } catch (error) {
      throw new BadRequestException(`Webhook signature verification failed: ${(error as Error).message}`);
    }
  }

  @Post('reservations')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reserve a vehicle (locks it for 72h)' })
  createReservation(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateReservationDto,
  ) {
    return this.paymentsService.createReservation(user.sub, dto, user.email);
  }

  @Post('checkout')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a Stripe checkout session for a reservation' })
  createCheckout(@CurrentUser() user: JwtPayload, @Body() dto: CreateCheckoutDto) {
    return this.paymentsService.createCheckout(user.sub, dto);
  }

  @Get('reservations/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a reservation with its payments' })
  getReservation(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.paymentsService.getReservation(user.sub, id);
  }

  @Post('reservations/:id/cancel')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancel a reservation' })
  cancelReservation(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: CancelReservationDto,
  ) {
    return this.paymentsService.cancelReservation(user.sub, id, dto.reason);
  }
}