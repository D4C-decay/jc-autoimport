import 'reflect-metadata';
import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator.js';
import { PrismaService } from '../../core/database/prisma.service.js';
import { RedisService } from '../../core/redis/redis.service.js';

@ApiTags('health')
@Controller()
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  @Public()
  @Get('/api/v1/health')
  @ApiOperation({ summary: 'Liveness and dependency health check' })
  async health(): Promise<{
    status: 'ok';
    uptime: number;
    timestamp: string;
    services: { database: 'up' | 'down'; redis: 'up' | 'down' };
  }> {
    let database: 'up' | 'down' = 'up';
    let redis: 'up' | 'down' = 'up';

    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch {
      database = 'down';
    }

    try {
      await this.redis.getClient().ping();
    } catch {
      redis = 'down';
    }

    return {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      services: { database, redis },
    };
  }
}