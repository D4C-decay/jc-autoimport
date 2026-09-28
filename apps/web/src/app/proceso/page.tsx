import type { Metadata } from 'next';
import { ProcessPage } from '@/components/process-page';

export const metadata: Metadata = {
  title: 'Proceso de importación',
  description:
    'Del catálogo a tu garaje en 5 pasos: selección, inspección de 120 puntos, compra y embarque, aduanas y taller, entrega llave en mano con garantía mecánica.',
};

export default function Page() {
  return <ProcessPage />;
}
