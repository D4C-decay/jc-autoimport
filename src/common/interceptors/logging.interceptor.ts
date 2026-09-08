import 'reflect-metadata';
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { LoggerService } from '../../core/logger/logger.service.js';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: LoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<{
      method: string;
      url: string;
      ip?: string;
    }>();
    const startedAt = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - startedAt;
          this.logger.log(
            `${request.method} ${request.url} ${duration}ms`,
            { method: request.method, url: request.url, durationMs: duration },
          );
        },
        error: (error: unknown) => {
          const duration = Date.now() - startedAt;
          this.logger.error(
            `${request.method} ${request.url} failed after ${duration}ms`,
            { method: request.method, url: request.url, durationMs: duration, err: error },
          );
        },
      }),
    );
  }
}
