import createMiddleware from 'next-intl/middleware';
import { NextResponse, type NextRequest } from 'next/server';
import { routing } from './i18n/routing';
import { copyCookies, refreshSession } from './lib/supabase/middleware';

const handleI18n = createMiddleware(routing);

/** Rutas que exigen sesión: se resuelven en el servidor, no en el cliente. */
const PROTECTED = ['/cuenta'];

function stripLocale(pathname: string): string {
  for (const locale of routing.locales) {
    if (pathname === `/${locale}`) return '/';
    if (pathname.startsWith(`/${locale}/`)) return pathname.slice(locale.length + 1);
  }
  return pathname;
}

function isProtected(pathname: string): boolean {
  const path = stripLocale(pathname);
  return PROTECTED.some((p) => path === p || path.startsWith(`${p}/`));
}

function loginUrl(req: NextRequest): URL {
  const { pathname, search } = req.nextUrl;
  const prefix = routing.locales.find(
    (l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`),
  );
  const url = new URL(prefix ? `/${prefix}/login` : '/login', req.url);
  url.searchParams.set('next', `${pathname}${search}`);
  return url;
}

export async function middleware(req: NextRequest) {
  // Supabase first: it may rotate the session cookies that the page needs.
  const { response: authResponse, userId } = await refreshSession(req);

  if (isProtected(req.nextUrl.pathname) && !userId) {
    const redirect = NextResponse.redirect(loginUrl(req));
    copyCookies(authResponse, redirect);
    return redirect;
  }

  const i18nResponse = handleI18n(req);
  copyCookies(authResponse, i18nResponse);
  return i18nResponse;
}

export const config = {
  // `auth` is excluded: /auth/confirm is a locale-less route handler.
  matcher: ['/((?!api|backend|auth|_next|_vercel|.*\\..*).*)'],
};
