import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { SUPABASE_ANON_KEY, SUPABASE_URL } from './config';

/**
 * Server-side Supabase client bound to the request cookies. Used by Server
 * Components, Route Handlers and Server Actions to read the session and to
 * let the SDK rotate tokens (it writes the refreshed cookies back).
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Called from a Server Component: Next forbids writing cookies here.
          // The middleware already refreshed the session, so this is safe.
        }
      },
    },
  });
}
