import { HomePage } from '@/components/home-page';
import { api } from '@/lib/api';

// Revalidate the featured grid hourly; the rest of the landing is static.
export const revalidate = 3600;

export default async function Page() {
  // 12 units: the conveyor keeps N cards + 1 clone, and the window can only ever
  // hold ~5, so a card can never be seen twice while the ring rotates.
  const featured = await api.featuredVehicles(12, 3600).catch(() => []);
  return <HomePage initialFeatured={featured} />;
}
