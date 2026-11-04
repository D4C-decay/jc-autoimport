import 'reflect-metadata';
import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppConfigService } from './config/app-config.service.js';
import { PrismaService } from './database/prisma.service.js';
import { RedisService } from './redis/redis.service.js';
import { LoggerService } from './logger/logger.service.js';
import { SupabaseAdminService } from './supabase/supabase-admin.service.js';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.local'],
    }),
  ],
  providers: [
    AppConfigService,
    PrismaService,
    RedisService,
    LoggerService,
    SupabaseAdminService,
  ],
  exports: [
    AppConfigService,
    PrismaService,
    RedisService,
    LoggerService,
    SupabaseAdminService,
  ],
})
export class CoreModule {}
