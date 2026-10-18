import type { Metadata } from 'next';
import { VerifyEmail } from '@/components/verify-email';

export const metadata: Metadata = {
  title: 'Confirmar correo',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  return <VerifyEmail token={token ?? ''} />;
}
