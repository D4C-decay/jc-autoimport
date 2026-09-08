import 'reflect-metadata';
import { SetMetadata } from '@nestjs/common';

export interface ThrottleOptions {
  ttl: number;
  limit: number;
}

export const THROTTLE_KEY = 'throttle';

export const Throttle = (options: ThrottleOptions): MethodDecorator & ClassDecorator => {
  return (
    target: object | Function,
    propertyKey?: string | symbol,
    descriptor?: PropertyDescriptor,
  ) => {
    if (typeof target === 'function' && propertyKey === undefined && descriptor === undefined) {
      SetMetadata(THROTTLE_KEY, options)(target);
      return;
    }
    SetMetadata(THROTTLE_KEY, options)(
      target as object,
      propertyKey as string | symbol,
      descriptor as PropertyDescriptor,
    );
  };
};
