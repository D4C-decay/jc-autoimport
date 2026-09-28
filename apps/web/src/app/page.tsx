import { HomePage } from '@/components/home-page';
import { api } from '@/lib/api';

// Revalidate the featured grid hourly; the rest of the landing is static.
export const revalidate = 3600;

export default async function Page() {
  const featured = await api.featuredVehicles(6, 3600).catch(() => []);
  return <HomePage initialFeatured={featured} />;
}
