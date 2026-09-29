import 'reflect-metadata';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type {
  AppConfig,
  DatabaseConfig,
  RedisConfig,
  JwtConfig,
  Argon2Config,
  AwsConfig,
  StripeConfig,
  RateLimitConfig,
} from './app-config.types.js';

@Injectable()
export class AppConfigService {
  constructor(private readonly config: ConfigService) {}

  get app(): AppConfig {
    return {
      nodeEnv: this.config.get<string>('NODE_ENV', 'development'),
      port: this.config.get<number>('PORT', 3000),
      host: this.config.get<string>('API_HOST', '0.0.0.0'),
      name: this.config.get<string>('APP_NAME', 'jc-autoimport-backend'),
      url: this.config.get<string>('APP_URL', 'http://localhost:3000'),
      corsOrigins: this.config
        .get<string>('CORS_ORIGINS', 'http://localhost:4200')
        .split(',')
        .map((o) => o.trim())
        .filter(Boolean),
    };
  }

  get database(): DatabaseConfig {
    return {
      url: this.config.get<string>('DATABASE_URL', ''),
    };
  }

  get redis(): RedisConfig {
    return {
      host: this.config.get<string>('REDIS_HOST', 'localhost'),
      port: this.config.get<number>('REDIS_PORT', 6379),
      password: this.config.get<string>('REDIS_PASSWORD') || undefined,
    };
  }

  get jwt(): JwtConfig {
    return {
      accessSecret: this.config.get<string>('JWT_ACCESS_SECRET', ''),
      refreshSecret: this.config.get<string>('JWT_REFRESH_SECRET', ''),
      accessExpiresIn: this.config.get<string>('JWT_ACCESS_EXPIRES_IN', '15m'),
      refreshExpiresIn: this.config.get<string>('JWT_REFRESH_EXPIRES_IN', '7d'),
    };
  }

  get argon2(): Argon2Config {
    return {
      memoryCost: this.config.get<number>('ARGON2_MEMORY_COST', 19456),
      timeCost: this.config.get<number>('ARGON2_TIME_COST', 2),
      parallelism: this.config.get<number>('ARGON2_PARALLELISM', 1),
    };
  }

  get aws(): AwsConfig {
    return {
      accessKeyId: this.config.get<string>('AWS_ACCESS_KEY_ID', ''),
      secretAccessKey: this.config.get<string>('AWS_SECRET_ACCESS_KEY', ''),
      region: this.config.get<string>('AWS_REGION', 'us-east-1'),
      bucket: this.config.get<string>('AWS_S3_BUCKET', ''),
      endpoint: this.config.get<string>('AWS_S3_ENDPOINT') || undefined,
    };
  }

  get stripe(): StripeConfig {
    return {
      secretKey: this.config.get<string>('STRIPE_SECRET_KEY', ''),
      webhookSecret: this.config.get<string>('STRIPE_WEBHOOK_SECRET', ''),
      currency: this.config.get<string>('STRIPE_CURRENCY', 'USD'),
    };
  }

  get rateLimit(): RateLimitConfig {
    return {
      globalTtl: this.config.get<number>('RATE_LIMIT_GLOBAL_TTL', 60),
      globalLimit: this.config.get<number>('RATE_LIMIT_GLOBAL_LIMIT', 120),
      authTtl: this.config.get<number>('RATE_LIMIT_AUTH_TTL', 60),
      authLimit: this.config.get<number>('RATE_LIMIT_AUTH_LIMIT', 5),
    };
  }
}
