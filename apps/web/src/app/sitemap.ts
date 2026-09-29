import type { MetadataRoute } from 'next';
import { api } from '@/lib/api';
import { resolveSiteUrl } from '@/lib/site';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const site = await resolveSiteUrl();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${site}/`, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${site}/catalogo`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${site}/proceso`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${site}/contacto`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
  ];

  const vehicles = await api
    .listVehicles({ limit: 100, withMedia: true })
    .then((r) => r.data ?? [])
    .catch(() => []);

  return [
    ...staticRoutes,
    ...vehicles.map((v) => ({
      url: `${site}/vehiculo/${v.slug}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
  ];
}
