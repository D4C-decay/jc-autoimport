import { NextResponse, type NextRequest } from 'next/server';

const ACCESS_COOKIE = 'jca_token';

/** Rutas que exigen sesión: se resuelven en el servidor, no en el cliente. */
const PROTECTED = ['/cuenta'];

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const needsAuth = PROTECTED.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  if (!needsAuth) return NextResponse.next();

  const hasSession = Boolean(req.cookies.get(ACCESS_COOKIE)?.value);
  if (hasSession) return NextResponse.next();

  const loginUrl = new URL('/login', req.url);
  loginUrl.searchParams.set('next', `${pathname}${search}`);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ['/cuenta/:path*'],
};
