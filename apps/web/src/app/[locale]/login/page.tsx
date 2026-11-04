import type { Metadata } from 'next';
import { LoginPage } from '@/components/login-page';

export const metadata: Metadata = {
  title: 'Acceso de clientes',
  description: 'Inicia sesión para dar seguimiento a tu importación y ver tus vehículos reservados.',
};

export const dynamic = 'force-dynamic';

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; auth_error?: string }>;
}) {
  const { next, auth_error } = await searchParams;
  return <LoginPage next={next} initialError={auth_error} />;
}
