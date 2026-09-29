import type { MetadataRoute } from 'next';
import { resolveSiteUrl } from '@/lib/site';

export const dynamic = 'force-dynamic';

export default async function robots(): Promise<MetadataRoute.Robots> {
  const site = await resolveSiteUrl();
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Private areas: no value in the index and they need authentication.
      disallow: ['/login', '/api/', '/backend/'],
    },
    sitemap: `${site}/sitemap.xml`,
  };
}
