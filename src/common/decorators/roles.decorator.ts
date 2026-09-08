import 'reflect-metadata';
import { SetMetadata } from '@nestjs/common';
import type { UserRole } from '../../../generated/prisma/client.js';

export const ROLES_KEY = 'roles';

export const Roles = (...roles: UserRole[]): MethodDecorator & ClassDecorator => {
  return (
    target: object | Function,
    propertyKey?: string | symbol,
    descriptor?: PropertyDescriptor,
  ) => {
    if (typeof target === 'function' && propertyKey === undefined && descriptor === undefined) {
      SetMetadata(ROLES_KEY, roles)(target);
      return;
    }
    SetMetadata(ROLES_KEY, roles)(
      target as object,
      propertyKey as string | symbol,
      descriptor as PropertyDescriptor,
    );
  };
};
