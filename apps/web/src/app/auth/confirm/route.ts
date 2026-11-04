import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { SUPABASE_ANON_KEY, SUPABASE_URL } from '@/lib/supabase/config';

/** Only same-site absolute paths are accepted as post-login destinations. */
function safeNext(value: string | null): string {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return '/cuenta';
  return value;
}

const OTP_TYPES = new Set(['signup', 'invite', 'magiclink', 'recovery', 'email_change', 'email']);

type PendingCookie = { name: string; value: string; options: CookieOptions };

/**
 * Landing point for every Supabase email link (confirmation, recovery, email
 * change). Works with both flows:
 *
 * - Custom email templates send `token_hash` + `type` (recommended).
 * - The default template redirects here with `?code=...` after Supabase
 *   verifies the token (PKCE flow used by @supabase/ssr).
 *
 * On success the session cookies are written and the user continues to `next`.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const tokenHash = searchParams.get('token_hash');
  const type = searchParams.get('type');
  const code = searchParams.get('code');
  const next = safeNext(searchParams.get('next'));

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return NextResponse.redirect(new URL('/login?auth_error=Supabase+no+configurado', origin));
  }

  // Collect the cookies the SDK wants to set; a custom redirect response
  // (unlike cookies() alone) is guaranteed to carry them with their options.
  const pending: PendingCookie[] = [];
  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value, options } of cookiesToSet) {
          pending.push({ name, value, options });
        }
      },
    },
  });

  let ok = false;

  if (tokenHash && type && OTP_TYPES.has(type)) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: type as 'signup' | 'invite' | 'magiclink' | 'recovery' | 'email_change' | 'email',
    });
    ok = !error;
  }

  if (!ok && code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    ok = !error;
  }

  const target = ok
    ? new URL(next, origin)
    : (() => {
        const login = new URL('/login', origin);
        login.searchParams.set(
          'auth_error',
          'El enlace es inválido o ha expirado. Solicita uno nuevo e inténtalo otra vez.',
        );
        return login;
      })();

  const response = NextResponse.redirect(target);
  for (const { name, value, options } of pending) {
    response.cookies.set(name, value, options);
  }
  return response;
}
