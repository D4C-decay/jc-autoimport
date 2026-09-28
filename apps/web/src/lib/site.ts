export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';
export const API_PREFIX = '/api/v1';
/** SITE_URL can be set at runtime: the sitemap and canonicals are server-side. */
export const SITE_URL =
  process.env.SITE_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:4200';

export const CONTACT_PHONE = '+1 (809) 555-0142';
export const CONTACT_PHONE_HREF = 'tel:+18095550142';
export const CONTACT_WHATSAPP = 'https://wa.me/18095550142';
export const CONTACT_EMAIL = 'ventas@jcautoimport.com';
export const CONTACT_ADDRESS = 'Av. 30 de Marzo, Santo Domingo, República Dominicana';
