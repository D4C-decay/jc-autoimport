import 'reflect-metadata';
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  NotFoundException,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, unknown> {
  intercept(context: ExecutionContext, next: CallHandler<T>): Observable<unknown> {
    const request = context.switchToHttp().getRequest();

    if (request.method === 'DELETE' || request.method === 'PATCH' || request.method === 'PUT') {
      return next.handle().pipe(
        map((data) => {
          if (data === undefined || data === null) {
            throw new NotFoundException('Resource not found');
          }
          return {
            success: true,
            data,
            timestamp: new Date().toISOString(),
          };
        }),
      );
    }

    return next.handle().pipe(
      map((data: T) => ({
        success: true,
        data,
        timestamp: new Date().toISOString(),
      })),
    );
  }
}
