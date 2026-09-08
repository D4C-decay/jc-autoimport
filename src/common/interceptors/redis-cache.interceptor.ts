import 'reflect-metadata';
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, from, of, switchMap, tap } from 'rxjs';
import { RedisService } from '../../core/redis/redis.service.js';
import { CACHE_KEY, type CacheConfig } from '../decorators/cache.decorator.js';
import type { Request } from 'express';

@Injectable()
export class RedisCacheInterceptor implements NestInterceptor {
  constructor(
    private readonly redis: RedisService,
    private readonly reflector: Reflector,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();

    if (request.method !== 'GET') {
      return next.handle();
    }

    const config = this.reflector.get<CacheConfig>(CACHE_KEY, context.getHandler());
    if (!config) {
      return next.handle();
    }

    const cacheKey = `${config.keyPrefix ?? 'cache'}:${request.originalUrl}`;

    return from(this.redis.get(cacheKey)).pipe(
      switchMap((cached: unknown) => {
        if (cached !== null) {
          return of(cached);
        }
        return next.handle().pipe(
          tap((data: unknown) => {
            void this.redis.set(cacheKey, data, config.ttl);
          }),
        );
      }),
    );
  }
}
