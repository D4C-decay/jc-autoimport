import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { Button, Eyebrow } from '@/components/ui';

/** Sin esto el 404 hereda `index, follow` del layout raíz y sale con dos <meta robots> en conflicto. */
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('NotFound');
  return {
    title: t('title'),
    robots: { index: false, follow: false },
  };
}

export default async function NotFound() {
  const t = await getTranslations('NotFound');

  return (
    <section className="flex min-h-[80svh] items-center pt-18">
      <div className="container-x text-center">
        <Eyebrow className="justify-center">Error 404</Eyebrow>
        <h1 className="mt-6 font-display text-[clamp(3rem,12vw,9rem)] leading-[0.85] text-smoke">
          <span className="text-signal">404</span>
        </h1>
        <p className="mx-auto mt-6 max-w-md text-sm text-ash">{t('message')}</p>
        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button href="/catalogo">{t('irCatalogo')}</Button>
          <Link
            href="/contacto"
            className="text-[11px] tracking-[0.24em] text-ash uppercase transition-colors hover:text-signal"
          >
            {t('buscarEncargo')}
          </Link>
        </div>
      </div>
    </section>
  );
}
