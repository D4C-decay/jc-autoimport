import createMiddleware from 'next-intl/middleware';
import { NextResponse, type NextRequest } from 'next/server';
import { routing } from './i18n/routing';

const handleI18n = createMiddleware(routing);

const ACCESS_COOKIE = 'jca_token';

/** Rutas que exigen sesión: se resuelven en el servidor, no en el cliente. */
const PROTECTED = ['/cuenta'];

function stripLocale(pathname: string): string {
  for (const locale of routing.locales) {
    if (pathname === `/${locale}`) return '/';
    if (pathname.startsWith(`/${locale}/`)) return pathname.slice(locale.length + 1);
  }
  return pathname;
}

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const needsAuth = PROTECTED.some((p) => {
    const path = stripLocale(pathname);
    return path === p || path.startsWith(`${p}/`);
  });
  if (needsAuth && !req.cookies.get(ACCESS_COOKIE)?.value) {
    const prefix = routing.locales.find(
      (l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`),
    );
    const loginUrl = new URL(prefix ? `/${prefix}/login` : '/login', req.url);
    loginUrl.searchParams.set('next', `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  return handleI18n(req);
}

export const config = {
  matcher: ['/((?!api|backend|_next|_vercel|.*\\..*).*)'],
};
