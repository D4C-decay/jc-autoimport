import { Suspense } from 'react';
import { CatalogPage } from '@/components/catalog-page';
import { api } from '@/lib/api';

export const metadata = {
  title: 'Catálogo de vehículos',
  description:
    'Explora nuestro catálogo de vehículos importados: filtra por marca, precio, año, combustible y carrocería. Cada unidad inspeccionada y lista para importar.',
};

export const revalidate = 300;

export default async function Page() {
  // Render the first page server-side so crawlers see real inventory instead of a shell.
  const res = await api.listVehicles({ limit: 12, withMedia: true }).catch(() => null);

  return (
    <Suspense fallback={<CatalogSkeleton />}>
      <CatalogPage
        initial={
          res
            ? {
                vehicles: res.data ?? [],
                nextCursor: res.meta?.nextCursor ?? null,
                hasMore: Boolean(res.meta?.hasMore),
              }
            : undefined
        }
      />
    </Suspense>
  );
}

function CatalogSkeleton() {
  return (
    <div className="container-x pt-32 pb-20">
      <div className="h-10 w-72 animate-pulse bg-ink-3" />
      <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="aspect-[4/3] animate-pulse bg-ink-3" />
        ))}
      </div>
    </div>
  );
}
