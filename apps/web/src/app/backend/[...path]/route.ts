import { NextResponse } from 'next/server';

const INTERNAL_API_URL = process.env.API_INTERNAL_URL ?? 'http://localhost:3000';
const TIMEOUT_MS = 15_000;

const ACCESS_COOKIE = 'jca_token';
const REFRESH_COOKIE = 'jca_refresh';

/**
 * Everything the browser is allowed to reach. The API itself stays on the
 * private network; this route is the only door to it, and it is narrow on
 * purpose: no users, audit, payments, media or health.
 */
const ALLOWED: Array<{ method: string; pattern: RegExp }> = [
  { method: 'GET', pattern: /^api\/v1\/vehicles$/ },
  { method: 'GET', pattern: /^api\/v1\/vehicles\/featured$/ },
  { method: 'GET', pattern: /^api\/v1\/vehicles\/[A-Za-z0-9-]+$/ },
  { method: 'GET', pattern: /^api\/v1\/search$/ },
  { method: 'GET', pattern: /^api\/v1\/search\/facets$/ },
  { method: 'GET', pattern: /^api\/v1\/search\/suggestions$/ },
  { method: 'GET', pattern: /^api\/v1\/auth\/me$/ },
  { method: 'GET', pattern: /^api\/v1\/auth\/2fa\/status$/ },
  { method: 'POST', pattern: /^api\/v1\/leads$/ },
  { method: 'POST', pattern: /^api\/v1\/auth\/login$/ },
  { method: 'POST', pattern: /^api\/v1\/auth\/register$/ },
  { method: 'POST', pattern: /^api\/v1\/auth\/verify-email$/ },
  { method: 'POST', pattern: /^api\/v1\/auth\/resend-verification$/ },
  { method: 'POST', pattern: /^api\/v1\/auth\/refresh$/ },
  { method: 'POST', pattern: /^api\/v1\/auth\/logout$/ },
  { method: 'POST', pattern: /^api\/v1\/auth\/2fa\/verify$/ },
  { method: 'POST', pattern: /^api\/v1\/auth\/2fa\/setup$/ },
  { method: 'POST', pattern: /^api\/v1\/auth\/2fa\/enable$/ },
  { method: 'POST', pattern: /^api\/v1\/auth\/2fa\/disable$/ },
];

/** Headers that describe the hop, not the payload. */
const DROP_REQUEST = ['host', 'connection', 'content-length', 'accept-encoding', 'origin', 'referer'];
/** Never forward these back: fetch already decoded the body. */
const DROP_RESPONSE = [
  'connection',
  'content-encoding',
  'content-length',
  'transfer-encoding',
  'keep-alive',
  'set-cookie',
];

function allowed(method: string, path: string): boolean {
  return ALLOWED.some((rule) => rule.method === method && rule.pattern.test(path));
}

function isSecure(req: Request): boolean {
  const proto = req.headers.get('x-forwarded-proto');
  if (proto) return proto.split(',')[0].trim() === 'https';
  return new URL(req.url).protocol === 'https:';
}

/** Serialise a session cookie. httpOnly so JS (and XSS) can never read it. */
function readCookie(header: string | null, name: string): string | undefined {
  if (!header) return undefined;
  for (const part of header.split(';')) {
    const [key, ...rest] = part.trim().split('=');
    if (key === name) return decodeURIComponent(rest.join('='));
  }
  return undefined;
}

function cookie(name: string, value: string, maxAge: number, secure: boolean): string {
  const parts = [
    `${name}=${encodeURIComponent(value)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${maxAge}`,
  ];
  if (secure) parts.push('Secure');
  return parts.join('; ');
}

function clearCookie(name: string, secure: boolean): string {
  const parts = [`${name}=`, 'Path=/', 'HttpOnly', 'SameSite=Lax', 'Max-Age=0'];
  if (secure) parts.push('Secure');
  return parts.join('; ');
}

type Ctx = { params: Promise<{ path: string[] }> };

async function proxy(req: Request, ctx: Ctx): Promise<Response> {
  const { path: segments } = await ctx.params;
  const path = segments.join('/');

  if (!allowed(req.method, path)) {
    return NextResponse.json(
      { success: false, message: 'Endpoint no disponible desde la web publica' },
      { status: 404 },
    );
  }

  // A cross-site form post would carry a foreign Origin; the real site never
  // does. Requests without Origin (curl, server-side) are left alone.
  const origin = req.headers.get('origin');
  if (req.method !== 'GET' && origin) {
    let originHost: string;
    try {
      originHost = new URL(origin).host;
    } catch {
      return NextResponse.json({ success: false, message: 'Origen invalido' }, { status: 403 });
    }
    if (originHost !== req.headers.get('host')) {
      return NextResponse.json({ success: false, message: 'Origen no permitido' }, { status: 403 });
    }
  }

  const target = new URL(`${INTERNAL_API_URL}/${path}`);
  target.search = new URL(req.url).search;

  const headers = new Headers();
  for (const [key, value] of req.headers) {
    if (!DROP_REQUEST.includes(key.toLowerCase())) headers.set(key, value);
  }

  let body: string | undefined;
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    body = await req.text();

    // Refresh sin token en el cuerpo: el proxy suple el token de la cookie
    // httpOnly para que la sesión se auto-regenere sin exponer nada a JS.
    if (path === 'api/v1/auth/refresh') {
      const stored = readCookie(req.headers.get('cookie'), REFRESH_COOKIE);
      if (stored) {
        try {
          const payload = JSON.parse(body || '{}') as { refreshToken?: string };
          if (!payload.refreshToken) {
            payload.refreshToken = stored;
            body = JSON.stringify(payload);
          }
        } catch {
          /* cuerpo no JSON: se deja pasar como va */
        }
      }
    }
  }

  try {
    const res = await fetch(target, {
      method: req.method,
      headers,
      body,
      cache: 'no-store',
      redirect: 'manual',
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    const out = new Headers();
    res.headers.forEach((value, key) => {
      if (!DROP_RESPONSE.includes(key.toLowerCase())) out.set(key, value);
    });
    if (req.method !== 'GET') out.set('cache-control', 'no-store');

    const secure = isSecure(req);

    // Session cookies: httpOnly, never readable by client JS.
    if (path === 'api/v1/auth/login' || path === 'api/v1/auth/refresh') {
      const text = await res.text();
      if (res.ok) {
        try {
          const envelope = JSON.parse(text) as {
            data?: { tokens?: { accessToken?: string; refreshToken?: string; expiresIn?: number } };
          };
          const tokens = envelope.data?.tokens;
          if (tokens?.accessToken && tokens?.refreshToken) {
            out.append('set-cookie', cookie(ACCESS_COOKIE, tokens.accessToken, tokens.expiresIn ?? 900, secure));
            out.append('set-cookie', cookie(REFRESH_COOKIE, tokens.refreshToken, 60 * 60 * 24 * 7, secure));
          }
        } catch {
          /* not JSON: pass through untouched */
        }
      }
      return new Response(text, { status: res.status, statusText: res.statusText, headers: out });
    }

    // Logout always clears the session, even if the upstream call fails.
    if (path === 'api/v1/auth/logout') {
      out.append('set-cookie', clearCookie(ACCESS_COOKIE, secure));
      out.append('set-cookie', clearCookie(REFRESH_COOKIE, secure));
      return new Response(res.body, { status: res.status, statusText: res.statusText, headers: out });
    }

    return new Response(res.body, { status: res.status, statusText: res.statusText, headers: out });
  } catch (error) {
    const reason = error instanceof Error ? error.message : 'error desconocido';
    return NextResponse.json(
      { success: false, message: `No se pudo contactar con la API: ${reason}` },
      { status: 502 },
    );
  }
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
