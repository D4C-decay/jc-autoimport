import 'reflect-metadata';
import { Injectable, Logger } from '@nestjs/common';
import Stripe from 'stripe';
import { AppConfigService } from '../../../core/config/app-config.service.js';

export interface CreateCheckoutParams {
  amount: number;
  currency: string;
  description: string;
  metadata: Record<string, string>;
  successUrl: string;
  cancelUrl: string;
  customerEmail?: string;
}

export interface CreatePaymentIntentParams {
  amount: number;
  currency: string;
  description: string;
  metadata: Record<string, string>;
  customerEmail?: string;
}

@Injectable()
export class StripeService {
  private readonly logger = new Logger(StripeService.name);
  private readonly stripe: Stripe;

  constructor(private readonly config: AppConfigService) {
    const secretKey = config.stripe.secretKey;
    if (!secretKey) {
      this.logger.warn('Stripe secret key not configured. Stripe operations disabled.');
    }
    this.stripe = new Stripe(secretKey, {
      apiVersion: '2026-08-26.dahlia',
    });
  }

  get isConfigured(): boolean {
    return Boolean(this.config.stripe.secretKey);
  }

  async createCheckoutSession(params: CreateCheckoutParams): Promise<{ sessionId: string; url: string }> {
    const session = await this.stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: params.currency,
            unit_amount: Math.round(params.amount * 100),
            product_data: {
              name: params.description,
            },
          },
        },
      ],
      metadata: params.metadata,
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      ...(params.customerEmail ? { customer_email: params.customerEmail } : {}),
    });

    return {
      sessionId: session.id,
      url: session.url ?? '',
    };
  }

  async createPaymentIntent(params: CreatePaymentIntentParams): Promise<{
    clientSecret: string;
    paymentIntentId: string;
  }> {
    const intent = await this.stripe.paymentIntents.create({
      amount: Math.round(params.amount * 100),
      currency: params.currency,
      description: params.description,
      metadata: params.metadata,
      ...(params.customerEmail ? { receipt_email: params.customerEmail } : {}),
    });

    return {
      clientSecret: intent.client_secret ?? '',
      paymentIntentId: intent.id,
    };
  }

  async constructWebhookEvent(
    payload: Buffer | string,
    signature: string,
  ): Promise<Stripe.Event> {
    return this.stripe.webhooks.constructEvent(
      payload,
      signature,
      this.config.stripe.webhookSecret,
    );
  }

  async retrieveCheckoutSession(sessionId: string): Promise<Stripe.Checkout.Session> {
    return this.stripe.checkout.sessions.retrieve(sessionId);
  }
}