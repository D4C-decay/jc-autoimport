import type { Metadata } from 'next';
import { RegisterPage } from '@/components/register-page';

export const metadata: Metadata = {
  title: 'Crear cuenta',
  description:
    'Crea tu cuenta en JC Autoimport para dar seguimiento a tu importación y ver tus unidades reservadas.',
  robots: { index: false, follow: false },
};

export default function Page() {
  return <RegisterPage />;
}
