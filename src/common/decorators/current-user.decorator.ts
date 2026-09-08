import 'reflect-metadata';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { JwtPayload } from '../types/index.js';

export const CurrentUser = createParamDecorator(
  (data: keyof JwtPayload | undefined, ctx: ExecutionContext): JwtPayload | JwtPayload[keyof JwtPayload] | undefined => {
    const request = ctx.switchToHttp().getRequest<{ user?: JwtPayload }>();
    const user = request.user;

    if (!user) return undefined;

    if (data) {
      return user[data];
    }
    return user;
  },
);
