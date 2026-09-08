import type { UserRole } from '../../../generated/prisma/client.js';

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
  iat?: number;
  exp?: number;
}

export interface JwtRequest {
  user?: JwtPayload;
}

export interface AuthenticatedUser extends JwtPayload {}
