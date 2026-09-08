import 'reflect-metadata';
import { Global, Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../../generated/prisma/client.js';
import { AppConfigService } from '../config/app-config.service.js';

@Global()
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor(private readonly config: AppConfigService) {
    super({
      adapter: new PrismaPg({
        connectionString: config.database.url,
        max: 20,
      }),
    });
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
    this.logger.log('Database connection established');
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
    this.logger.log('Database connection closed');
  }

  async cleanDatabase(): Promise<void> {
    if (this.config.app.nodeEnv === 'test') {
      await this.$transaction([
        this.review.deleteMany(),
        this.payment.deleteMany(),
        this.reservation.deleteMany(),
        this.lead.deleteMany(),
        this.media.deleteMany(),
        this.vehicleSpecification.deleteMany(),
        this.specification.deleteMany(),
        this.vehicle.deleteMany(),
        this.refreshToken.deleteMany(),
        this.auditLog.deleteMany(),
        this.user.deleteMany(),
      ]);
    }
  }
}
