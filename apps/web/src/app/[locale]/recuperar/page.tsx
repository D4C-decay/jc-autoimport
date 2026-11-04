import type { Metadata } from 'next';
import { ForgotPassword } from '@/components/forgot-password';

export const metadata: Metadata = {
  title: 'Recuperar contraseña',
  robots: { index: false, follow: false },
};

export default function Page() {
  return <ForgotPassword />;
}
