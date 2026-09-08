import 'reflect-metadata';
import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { AppConfigService } from '../../core/config/app-config.service.js';
import { RedisService } from '../../core/redis/redis.service.js';
import { THROTTLE_KEY, type ThrottleOptions } from '../decorators/throttle.decorator.js';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator.js';

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(
    private readonly redis: RedisService,
    private readonly config: AppConfigService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const custom = this.reflector.getAllAndOverride<ThrottleOptions>(THROTTLE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const isAuthEndpoint = context.switchToHttp().getRequest<Request>().path.startsWith('/api/v1/auth');

    const options: ThrottleOptions = custom ?? {
      ttl: this.config.rateLimit.globalTtl,
      limit: isAuthEndpoint
        ? this.config.rateLimit.authLimit
        : this.config.rateLimit.globalLimit,
    };

    if (isPublic && !custom) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const ip =
      request.headers['x-forwarded-for']?.toString().split(',')[0].trim() ||
      request.ip ||
      'unknown';

    const route = `${request.method}:${request.path}`;
    const key = `rl:${route}:${ip}`;

    const result = await this.redis.rateLimit(key, options.limit, options.ttl);

    if (!result.allowed) {
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: 'Too many requests, please try again later',
          retryAfter: result.ttl,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return true;
  }
}
