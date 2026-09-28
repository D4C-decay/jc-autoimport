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
    return { title: 'Vehículo no encontrado' };
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
