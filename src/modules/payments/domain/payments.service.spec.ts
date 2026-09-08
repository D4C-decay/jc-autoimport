import 'reflect-metadata';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { PaymentsService } from './payments.service.js';
import type { PrismaService } from '../../../core/database/prisma.service.js';
import type { RedisService } from '../../../core/redis/redis.service.js';
import type { AppConfigService } from '../../../core/config/app-config.service.js';
import type { StripeService } from './stripe.service.js';
import { EventEmitter2 } from '@nestjs/event-emitter';
import type { CreateReservationDto } from '../infrastructure/dto/payment.dto.js';

describe('PaymentsService', () => {
  let service: PaymentsService;
  let findVehicle: ReturnType<typeof vi.fn>;
  let lockSet: ReturnType<typeof vi.fn>;
  let redisDelete: ReturnType<typeof vi.fn>;
  let redisDeletePattern: ReturnType<typeof vi.fn>;
  let eventEmit: ReturnType<typeof vi.fn>;
  let transaction: ReturnType<typeof vi.fn>;
  let txReservationCreate: ReturnType<typeof vi.fn>;
  let txVehicleUpdate: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    findVehicle = vi.fn();
    lockSet = vi.fn();
    redisDelete = vi.fn().mockResolvedValue(undefined);
    redisDeletePattern = vi.fn().mockResolvedValue(undefined);
    eventEmit = vi.fn();

    txReservationCreate = vi.fn();
    txVehicleUpdate = vi.fn();
    const tx = {
      reservation: { create: txReservationCreate },
      vehicle: { update: txVehicleUpdate },
    };
    transaction = vi.fn(async (cb: (t: typeof tx) => unknown) => cb(tx));

    const prisma = {
      vehicle: { findUnique: findVehicle },
      reservation: { findFirst: vi.fn() },
      $transaction: transaction,
    } as unknown as PrismaService;

    const redis = {
      getClient: () => ({ set: lockSet }),
      delete: redisDelete,
      deleteByPattern: redisDeletePattern,
    } as unknown as RedisService;

    service = new PaymentsService(
      prisma,
      redis,
      {} as unknown as AppConfigService,
      {} as unknown as StripeService,
      { emit: eventEmit } as unknown as EventEmitter2,
    );
  });

  it('reserves an available vehicle and flips its status to RESERVED', async () => {
    findVehicle.mockResolvedValue({ id: 'v1', status: 'AVAILABLE' });
    lockSet.mockResolvedValue('OK');
    txReservationCreate.mockResolvedValue({ id: 'r1', depositAmount: '500' });

    const dto = { vehicleId: 'v1', depositAmount: 500 } as CreateReservationDto;
    const result = await service.createReservation('u1', dto, 'buyer@example.com');

    expect(txVehicleUpdate).toHaveBeenCalledWith({
      where: { id: 'v1' },
      data: { status: 'RESERVED' },
    });
    expect(eventEmit).toHaveBeenCalledWith('reservation.created', expect.objectContaining({ userId: 'u1' }));
    expect(redisDelete).toHaveBeenCalledWith('reservation:lock:v1');
    expect(result).toEqual({ id: 'r1', depositAmount: '500' });
  });

  it('rejects reservation of a sold vehicle before acquiring the lock', async () => {
    findVehicle.mockResolvedValue({ id: 'v1', status: 'SOLD' });

    await expect(
      service.createReservation('u1', { vehicleId: 'v1', depositAmount: 500 } as CreateReservationDto, 'b@e.com'),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(lockSet).not.toHaveBeenCalled();
  });

  it('rejects when the distributed lock is held by another reservation', async () => {
    findVehicle.mockResolvedValue({ id: 'v1', status: 'AVAILABLE' });
    lockSet.mockResolvedValue(null);

    await expect(
      service.createReservation('u1', { vehicleId: 'v1', depositAmount: 500 } as CreateReservationDto, 'b@e.com'),
    ).rejects.toThrow('being reserved by another user');
  });

  it('cancels a reservation and reopens the vehicle for sale', async () => {
    const findReservation = vi.fn().mockResolvedValue({
      id: 'r1',
      userId: 'u1',
      vehicleId: 'v1',
    });
    const updateReservation = vi.fn().mockResolvedValue({});
    const updateVehicle = vi.fn().mockResolvedValue({});
    const tx2 = {
      reservation: { update: updateReservation },
      vehicle: { update: updateVehicle },
    };
    const prisma = {
      reservation: { findUnique: findReservation },
      $transaction: vi.fn(async (cb: (t: typeof tx2) => unknown) => cb(tx2)),
    } as unknown as PrismaService;
    const svc = new PaymentsService(
      prisma,
      {
        getClient: () => ({ set: vi.fn() }),
        delete: redisDelete,
        deleteByPattern: redisDeletePattern,
      } as unknown as RedisService,
      {} as unknown as AppConfigService,
      {} as unknown as StripeService,
      { emit: eventEmit } as unknown as EventEmitter2,
    );

    const result = await svc.cancelReservation('u1', 'r1', 'changed my mind');

    expect(updateReservation).toHaveBeenCalledWith({
      where: { id: 'r1' },
      data: { status: 'cancelled', notes: 'changed my mind' },
    });
    expect(updateVehicle).toHaveBeenCalledWith({
      where: { id: 'v1' },
      data: { status: 'AVAILABLE' },
    });
    expect(eventEmit).toHaveBeenCalledWith('reservation.cancelled', {
      reservationId: 'r1',
      vehicleId: 'v1',
    });
    expect(result).toEqual({ success: true });
  });

  it('hides reservations of others from non-privileged users', async () => {
    const findReservation = vi.fn().mockResolvedValue({ id: 'r1', userId: 'someone-else' });
    const findUser = vi.fn().mockResolvedValue({ role: 'CLIENT' });
    const prisma = {
      reservation: { findUnique: findReservation },
      user: { findUnique: findUser },
    } as unknown as PrismaService;
    const svc = new PaymentsService(
      prisma,
      {
        getClient: () => ({ set: vi.fn() }),
        delete: redisDelete,
        deleteByPattern: redisDeletePattern,
      } as unknown as RedisService,
      {} as unknown as AppConfigService,
      {} as unknown as StripeService,
      { emit: eventEmit } as unknown as EventEmitter2,
    );

    await expect(svc.getReservation('u2', 'r1')).rejects.toBeInstanceOf(NotFoundException);
  });
});