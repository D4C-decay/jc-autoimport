import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { CONTACT_ADDRESS, CONTACT_EMAIL, CONTACT_PHONE, CONTACT_WHATSAPP } from '@/lib/site';
import { Wordmark } from './navbar';

const columns = [
  {
    titleKey: 'navTitle',
    links: [
      { href: '/', key: 'inicio' },
      { href: '/catalogo', key: 'catalogo' },
      { href: '/proceso', key: 'procesoImportacion' },
      { href: '/contacto', key: 'contacto' },
    ],
  },
  {
    titleKey: 'serviciosTitle',
    links: [
      { href: { pathname: '/catalogo', query: { fuelType: 'ELECTRIC' } }, key: 'electricos' },
      { href: { pathname: '/catalogo', query: { fuelType: 'HYBRID' } }, key: 'hibridos' },
      { href: { pathname: '/catalogo', query: { bodyType: 'SUV' } }, key: 'suv' },
      { href: { pathname: '/catalogo', query: { priceMax: '30000' } }, key: 'desde30' },
    ],
  },
];

export async function Footer() {
  const t = await getTranslations('Footer');

  return (
    <footer className="relative mt-px border-t border-line bg-ink-2">
      <div className="container-x grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-4 lg:py-20">
        <div className="lg:col-span-1">
          <div className="text-smoke">
            <Wordmark className="h-7" />
          </div>
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-ash">{t('tagline')}</p>
          <div className="mt-6 flex gap-2">
            <a
              href={CONTACT_WHATSAPP}
              target="_blank"
              rel="noreferrer"
              className="border border-line px-4 py-2 text-[10px] tracking-[0.2em] text-ash uppercase transition-colors hover:border-signal hover:text-signal"
            >
              {t('whatsapp')}
            </a>
            <Link
              href="/login"
              className="border border-line px-4 py-2 text-[10px] tracking-[0.2em] text-ash uppercase transition-colors hover:border-signal hover:text-signal"
            >
              {t('accesoCliente')}
            </Link>
          </div>
        </div>

        {columns.map((col) => (
          <div key={col.titleKey}>
            <h4 className="text-[10px] font-semibold tracking-[0.28em] text-signal uppercase">
              {t(col.titleKey)}
            </h4>
            <ul className="mt-5 space-y-3">
              {col.links.map((l) => (
                <li key={l.key}>
                  <Link
                    href={l.href}
                    className="text-sm text-ash transition-colors duration-300 hover:text-smoke"
                  >
                    {t(l.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div>
          <h4 className="text-[10px] font-semibold tracking-[0.28em] text-signal uppercase">
            {t('contactoTitle')}
          </h4>
          <ul className="mt-5 space-y-3 text-sm text-ash">
            <li>
              <a href={`tel:${CONTACT_PHONE.replace(/[^\d+]/g, '')}`} className="transition-colors hover:text-smoke">
                {CONTACT_PHONE}
              </a>
            </li>
            <li>
              <a href={`mailto:${CONTACT_EMAIL}`} className="transition-colors hover:text-smoke">
                {CONTACT_EMAIL}
              </a>
            </li>
            <li className="leading-relaxed">{CONTACT_ADDRESS}</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="container-x flex flex-col gap-3 py-6 text-[10px] tracking-[0.18em] text-ash/60 uppercase sm:flex-row sm:items-center sm:justify-between">
          <span>
            © {new Date().getFullYear()} JC Autoimport. {t('derechos')}
            <span className="mt-1 block text-[9px] tracking-[0.14em] normal-case">
              {t('educativo')}
            </span>
          </span>
          <div className="flex gap-6">
            <span>{t('privacidad')}</span>
            <span>{t('terminos')}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
