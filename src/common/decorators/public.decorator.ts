import 'reflect-metadata';
import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

export const Public = (): MethodDecorator & ClassDecorator => {
  return (target: object | Function, propertyKey?: string | symbol, descriptor?: PropertyDescriptor) => {
    if (typeof target === 'function' && propertyKey === undefined && descriptor === undefined) {
      SetMetadata(IS_PUBLIC_KEY, true)(target);
      return;
    }
    SetMetadata(IS_PUBLIC_KEY, true)(target as object, propertyKey as string | symbol, descriptor as PropertyDescriptor);
  };
};
