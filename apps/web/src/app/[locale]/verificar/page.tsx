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
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;
  return <VerifyEmail email={email ?? ''} />;
}
