/**
 * Supabase public configuration. Both values are safe to ship to the browser:
 * the anon key only grants what Row Level Security allows, and RLS is
 * deny-all here — the browser only uses Supabase Auth.
 */
export const SUPABASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').replace(/\/+$/, '');
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

export function hasSupabaseConfig(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}

/** Absolute URL Supabase will bounce back to after an email link. */
export function authRedirect(path = '/cuenta'): string {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL ??
    (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:4200');
  return `${base.replace(/\/+$/, '')}/auth/confirm?next=${encodeURIComponent(path)}`;
}
