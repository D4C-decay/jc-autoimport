import 'reflect-metadata';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../../core/database/prisma.service.js';
import { RedisService } from '../../../core/redis/redis.service.js';
import { AppConfigService } from '../../../core/config/app-config.service.js';
import { StripeService } from './stripe.service.js';
import type Stripe from 'stripe';
import { CreateCheckoutDto, CreateReservationDto } from '../infrastructure/dto/payment.dto.js';

const RESERVATION_TTL_HOURS = 72;
const RESERVATION_HOLD_LOCK_TTL = 60;

@Injectable()
export class PaymentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly config: AppConfigService,
    private readonly stripe: StripeService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async createReservation(
    userId: string,
    dto: CreateReservationDto,
    customerEmail: string,
  ): Promise<unknown> {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id: dto.vehicleId },
    });

    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    if (vehicle.status === 'SOLD') {
      throw new ConflictException('This vehicle is already sold');
    }

    // Distributed lock to prevent concurrent reservations of the same vehicle
    const lockKey = `reservation:lock:${dto.vehicleId}`;
    const acquired = await this.redis
      .getClient()
      .set(lockKey, userId, 'EX', RESERVATION_HOLD_LOCK_TTL, 'NX');

    if (!acquired) {
      throw new ConflictException('This vehicle is being reserved by another user right now');
    }

    try {
      if (vehicle.status === 'RESERVED') {
        const activeReservation = await this.prisma.reservation.findFirst({
          where: { vehicleId: dto.vehicleId, status: 'active' },
        });
        if (activeReservation && new Date(activeReservation.expiresAt) > new Date()) {
          throw new ConflictException('This vehicle is already reserved');
        }
      }

      const reservation = await this.prisma.$transaction(async (tx) => {
        const created = await tx.reservation.create({
          data: {
            vehicleId: dto.vehicleId,
            userId,
            depositAmount: dto.depositAmount.toString(),
            status: 'active',
            expiresAt: new Date(Date.now() + RESERVATION_TTL_HOURS * 60 * 60 * 1000),
          },
          include: { vehicle: { select: { brand: true, model: true, year: true, price: true } } },
        });

        await tx.vehicle.update({
          where: { id: dto.vehicleId },
          data: { status: 'RESERVED' },
        });

        return created;
      });

      await this.invalidateVehicleCaches(dto.vehicleId);

      this.eventEmitter.emit('reservation.created', {
        reservationId: reservation.id,
        userId,
        vehicleId: dto.vehicleId,
        depositAmount: dto.depositAmount,
        customerEmail,
      });

      return reservation;
    } finally {
      await this.redis.delete(lockKey);
    }
  }

  async createCheckout(
    userId: string,
    dto: CreateCheckoutDto,
  ): Promise<{ sessionId: string; url: string }> {
    const reservation = await this.prisma.reservation.findFirst({
      where: { id: dto.reservationId, userId },
      include: { vehicle: { select: { brand: true, model: true, year: true } } },
    });

    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    if (reservation.status !== 'active') {
      throw new BadRequestException('Reservation is not active');
    }

    if (!this.stripe.isConfigured) {
      throw new BadRequestException('Payments not configured');
    }

    const successUrl = dto.successUrl ?? `${this.config.app.url}/reservations/${reservation.id}/success`;
    const cancelUrl = dto.cancelUrl ?? `${this.config.app.url}/reservations/${reservation.id}/cancel`;

    const checkout = await this.stripe.createCheckoutSession({
      amount: Number(reservation.depositAmount),
      currency: reservation.vehicle ? 'USD' : 'USD',
      description: `Deposito de reserva - ${reservation.vehicle?.brand ?? ''} ${reservation.vehicle?.model ?? ''}`,
      metadata: {
        reservationId: reservation.id,
        vehicleId: reservation.vehicleId,
        userId,
      },
      successUrl,
      cancelUrl,
    });

    await this.prisma.payment.create({
      data: {
        reservationId: reservation.id,
        amount: reservation.depositAmount,
        currency: 'USD',
        status: 'PENDING',
        stripeSessionId: checkout.sessionId,
        method: 'card',
      },
    });

    return checkout;
  }

  async getReservation(userId: string, reservationId: string): Promise<unknown> {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id: reservationId },
      include: {
        vehicle: {
          select: {
            id: true,
            brand: true,
            model: true,
            year: true,
            slug: true,
            price: true,
            status: true,
          },
        },
        payments: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    if (reservation.userId !== userId) {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { role: true },
      });
      if (!user || (user.role !== 'ADMIN' && user.role !== 'MANAGER' && user.role !== 'SELLER')) {
        throw new NotFoundException('Reservation not found');
      }
    }

    return reservation;
  }

  async cancelReservation(
    userId: string,
    reservationId: string,
    reason?: string,
  ): Promise<{ success: boolean }> {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id: reservationId },
    });

    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    if (reservation.userId !== userId) {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { role: true },
      });
      if (!user || (user.role !== 'ADMIN' && user.role !== 'MANAGER' && user.role !== 'SELLER')) {
        throw new NotFoundException('Reservation not found');
      }
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.reservation.update({
        where: { id: reservationId },
        data: {
          status: 'cancelled',
          ...(reason ? { notes: reason } : {}),
        },
      });

      await tx.vehicle.update({
        where: { id: reservation.vehicleId },
        data: { status: 'AVAILABLE' },
      });
    });

    await this.invalidateVehicleCaches(reservation.vehicleId);
    this.eventEmitter.emit('reservation.cancelled', {
      reservationId,
      vehicleId: reservation.vehicleId,
    });

    return { success: true };
  }

async handleStripeEvent(event: Stripe.Event): Promise<void> {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const reservationId = session.metadata?.reservationId;

        if (reservationId) {
          await this.prisma.payment.updateMany({
            where: { stripeSessionId: session.id },
            data: { status: 'COMPLETED' },
          });

          const reservation = await this.prisma.reservation.findUnique({
            where: { id: reservationId },
          });
          if (reservation) {
            await this.prisma.reservation.update({
              where: { id: reservationId },
              data: { status: 'completed', completedAt: new Date() },
            });
            await this.prisma.vehicle.update({
              where: { id: reservation.vehicleId },
              data: { status: 'SOLD' },
            });
            await this.invalidateVehicleCaches(reservation.vehicleId);

            this.eventEmitter.emit('payment.completed', {
              reservationId,
              amount: reservation.depositAmount,
            });
          }
        }
        break;
      }
      case 'payment_intent.payment_failed': {
        const intent = event.data.object as Stripe.PaymentIntent;
        await this.prisma.payment.updateMany({
          where: { stripePaymentId: intent.id },
          data: { status: 'FAILED' },
        });
        break;
      }
      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        if (charge.payment_intent) {
          await this.prisma.payment.updateMany({
            where: { stripePaymentId: charge.payment_intent as string },
            data: { status: 'REFUNDED' },
          });
        }
        break;
      }
      default:
        break;
    }
  }

  private async invalidateVehicleCaches(vehicleId: string): Promise<void> {
    await this.redis.delete(`vehicle:${vehicleId}`);
    await this.redis.deleteByPattern('catalog:*');
    await this.redis.deleteByPattern('search:*');
  }
}