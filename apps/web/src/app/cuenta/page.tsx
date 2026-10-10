import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { BadgeCheck, Mail, ShieldCheck, UserRound } from 'lucide-react';
import { serverMe } from '@/lib/api';
import { LogoutButton } from '@/components/logout-button';
import { TwoFactorSettings } from '@/components/two-factor-settings';
import { EmailVerifyBanner } from '@/components/email-verify-banner';
import { Eyebrow } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Área de cliente',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function AccountPage() {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  const user = await serverMe(cookieHeader);

  // La sesión se valida en el servidor: sin cookie válida no se renderiza nada.
  if (!user) redirect('/login?next=/cuenta');

  const name = [user.firstName, user.lastName].filter(Boolean).join(' ') || 'Cliente';

  return (
    <section className="relative min-h-[100svh] overflow-hidden pt-30 pb-24">
      <div className="absolute inset-0 bg-gradient-to-b from-ink-2 to-ink" />

      <div className="container-x relative">
        <Eyebrow index="Cuenta">Área de cliente</Eyebrow>
        <h1 className="mt-5 font-display text-4xl leading-[0.95] text-smoke lg:text-5xl">
          Hola, <span className="text-signal">{name.split(' ')[0]}</span>
        </h1>
        <p className="mt-4 max-w-xl text-sm text-ash">
          Aquí puedes revisar tu sesión y la seguridad de tu cuenta.
        </p>

        {user.emailVerified === false ? (
          <div className="mt-10">
            <EmailVerifyBanner email={user.email} />
          </div>
        ) : null}

        <div className="mt-12 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="border border-line bg-ink-2 p-7 md:p-8">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-sm tracking-[0.16em] text-smoke uppercase">
                Datos de la cuenta
              </h2>
              <BadgeCheck className="size-5 text-signal" strokeWidth={1.7} />
            </div>
            <dl className="mt-7 space-y-5 text-sm">
              <div className="flex items-center gap-3">
                <UserRound className="size-4 text-ash" strokeWidth={1.7} />
                <div>
                  <dt className="text-[10px] tracking-[0.2em] text-ash uppercase">Nombre</dt>
                  <dd className="text-smoke">{name}</dd>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="size-4 text-ash" strokeWidth={1.7} />
                <div>
                  <dt className="text-[10px] tracking-[0.2em] text-ash uppercase">Correo</dt>
                  <dd className="text-smoke">{user.email}</dd>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <ShieldCheck className="size-4 text-ash" strokeWidth={1.7} />
                <div>
                  <dt className="text-[10px] tracking-[0.2em] text-ash uppercase">Rol</dt>
                  <dd className="text-smoke">{user.role}</dd>
                </div>
              </div>
            </dl>
            <div className="mt-8 border-t border-line pt-7">
              <LogoutButton />
            </div>
          </div>

          <TwoFactorSettings />
        </div>
      </div>
    </section>
  );
}
