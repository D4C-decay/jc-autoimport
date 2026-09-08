import 'reflect-metadata';
import { Module } from '@nestjs/common';
import { PaymentsService } from './domain/payments.service.js';
import { StripeService } from './domain/stripe.service.js';
import { PaymentsController } from './infrastructure/payments.controller.js';

@Module({
  controllers: [PaymentsController],
  providers: [PaymentsService, StripeService],
  exports: [PaymentsService, StripeService],
})
export class PaymentsModule {}