import 'reflect-metadata';
import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppConfigService } from './config/app-config.service.js';
import { PrismaService } from './database/prisma.service.js';
import { RedisService } from './redis/redis.service.js';
import { LoggerService } from './logger/logger.service.js';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.local'],
    }),
  ],
  providers: [AppConfigService, PrismaService, RedisService, LoggerService],
  exports: [AppConfigService, PrismaService, RedisService, LoggerService],
})
export class CoreModule {}
