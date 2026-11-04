import type { UserRole } from '../../../generated/prisma/client.js';

export interface JwtPayload {
  /** Local user id (public.users.id). Controllers keep using this as `sub`. */
  sub: string;
  /** Supabase Auth user id (auth.users.id). */
  authId?: string;
  email: string;
  role: UserRole;
  firstName?: string | null;
  lastName?: string | null;
  /** Authenticator Assurance Level from the Supabase token (aal1/aal2). */
  aal?: string;
  iat?: number;
  exp?: number;
}

export interface JwtRequest {
  user?: JwtPayload;
}

export interface AuthenticatedUser extends JwtPayload {}
