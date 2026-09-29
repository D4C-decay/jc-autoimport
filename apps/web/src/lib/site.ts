export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';
export const API_PREFIX = '/api/v1';
/** SITE_URL can be set at runtime: the sitemap and canonicals are server-side. */
export const SITE_URL =
  process.env.SITE_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:4200';

/**
 * Same idea, but asking the request. A quick tunnel hands out a new hostname on
 * every restart, and the sitemap would otherwise advertise the old one. Behind
 * Cloudflare the `Host` header already carries the public name; the
 * `x-forwarded-*` pair is the fallback for other reverse proxies.
 */
export async function resolveSiteUrl(): Promise<string> {
  const configured = process.env.SITE_URL ?? process.env.NEXT_PUBLIC_SITE_URL;
  if (configured) return configured;

  const { headers } = await import('next/headers');
  const h = await headers();
  const host = h.get('host') ?? h.get('x-forwarded-host');
  if (!host) return SITE_URL;
  const proto = h.get('x-forwarded-proto') ?? (host.startsWith('localhost') ? 'http' : 'https');
  return `${proto}://${host}`;
}

export const CONTACT_PHONE = '+1 (809) 555-0142';
export const CONTACT_PHONE_HREF = 'tel:+18095550142';
export const CONTACT_WHATSAPP = 'https://wa.me/18095550142';
export const CONTACT_EMAIL = 'ventas@jcautoimport.com';
export const CONTACT_ADDRESS = 'Av. 30 de Marzo, Santo Domingo, República Dominicana';
