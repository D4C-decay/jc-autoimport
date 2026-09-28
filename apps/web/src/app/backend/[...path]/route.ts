import { NextResponse } from 'next/server';

const INTERNAL_API_URL = process.env.API_INTERNAL_URL ?? 'http://localhost:3000';
const TIMEOUT_MS = 15_000;

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
  { method: 'POST', pattern: /^api\/v1\/leads$/ },
  { method: 'POST', pattern: /^api\/v1\/auth\/login$/ },
  { method: 'POST', pattern: /^api\/v1\/auth\/refresh$/ },
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
