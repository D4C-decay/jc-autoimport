'use client';

import { createBrowserClient } from '@supabase/ssr';
import { SUPABASE_ANON_KEY, SUPABASE_URL } from './config';

type BrowserClient = ReturnType<typeof createBrowserClient>;

let client: BrowserClient | undefined;

/**
 * Browser-side Supabase client. Only Auth is used from the browser; domain
 * data always goes through the `/backend` proxy.
 */
export function createClient(): BrowserClient {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error(
      'Supabase no está configurado: faltan NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY.',
    );
  }

  client ??= createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  return client;
}
