import type { Metadata } from 'next';
import { LoginPage } from '@/components/login-page';

export const metadata: Metadata = {
  title: 'Acceso de clientes',
  description: 'Inicia sesión para dar seguimiento a tu importación y ver tus vehículos reservados.',
};

export default function Page() {
  return <LoginPage />;
}
