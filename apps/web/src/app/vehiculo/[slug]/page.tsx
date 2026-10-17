import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { api } from '@/lib/api';
import { VehicleDetailPage } from '@/components/vehicle-detail-page';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const v = await api.vehicleBySlug(slug);
    return {
      title: `${v.brand} ${v.model} ${v.year}`,
      description: `${v.brand} ${v.model} ${v.year} — ${v.horsepower} HP, ${Number(v.mileage).toLocaleString('en-US')} mi. Vehículo importado e inspeccionado por JC Autoimport.`,
      openGraph: {
        title: `${v.brand} ${v.model} ${v.year}`,
        images: v.primaryImageUrl ? [v.primaryImageUrl] : undefined,
      },
    };
  } catch {
    // Ojo: si generateMetadata resuelve con normalidad, Next ya compromete el 200
    // y el notFound() posterior devuelve 200 con la UI de 404 (soft-404, malo para SEO).
    notFound();
  }
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  let vehicle;
  try {
    vehicle = await api.vehicleBySlug(slug);
  } catch {
    notFound();
  }
  return <VehicleDetailPage vehicle={vehicle} />;
}
