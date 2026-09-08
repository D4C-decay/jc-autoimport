import 'reflect-metadata';
import { SetMetadata } from '@nestjs/common';

export const CACHE_KEY = 'cacheConfig';

export interface CacheConfig {
  ttl: number;
  keyPrefix?: string;
}

export const CacheTTL = (config: CacheConfig): MethodDecorator => {
  return (target: object, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
    SetMetadata(CACHE_KEY, {
      ...config,
      ttl: config.ttl,
      keyPrefix: config.keyPrefix,
    })(target, propertyKey, descriptor);
    return descriptor;
  };
};
