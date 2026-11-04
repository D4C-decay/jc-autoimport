import type { Metadata } from 'next';
import { ResetPassword } from '@/components/reset-password';

export const metadata: Metadata = {
  title: 'Nueva contraseña',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default function Page() {
  return <ResetPassword />;
}
