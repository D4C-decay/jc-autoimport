import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { SUPABASE_ANON_KEY, SUPABASE_URL } from './config';

export type SessionRefresh = {
  /** Response carrying the refreshed Supabase cookies. */
  response: NextResponse;
  /** Supabase user id, or null when there is no valid session. */
  userId: string | null;
};

/**
 * Refreshes the Supabase session on every request that passes through the
 * middleware. The SDK rotates the access/refresh tokens and writes them back
 * as cookies; the response is then merged with the i18n middleware response.
 */
export async function refreshSession(request: NextRequest): Promise<SessionRefresh> {
  let response = NextResponse.next({ request });

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return { response, userId: null };
  }

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  // getUser() validates the token against Supabase (unlike getSession, which
  // only reads the cookie). Never trust the cookie without this check.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { response, userId: user?.id ?? null };
}

/** Copies every Set-Cookie from one response to another. */
export function copyCookies(from: NextResponse, to: NextResponse): void {
  for (const cookie of from.cookies.getAll()) {
    to.cookies.set(cookie);
  }
}
