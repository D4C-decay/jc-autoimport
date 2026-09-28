import Link from 'next/link';
import { CONTACT_ADDRESS, CONTACT_EMAIL, CONTACT_PHONE, CONTACT_WHATSAPP } from '@/lib/site';
import { Wordmark } from './navbar';

const columns = [
  {
    title: 'Navegación',
    links: [
      { href: '/', label: 'Inicio' },
      { href: '/catalogo', label: 'Catálogo' },
      { href: '/proceso', label: 'Proceso de importación' },
      { href: '/contacto', label: 'Contacto' },
    ],
  },
  {
    title: 'Servicios',
    links: [
      { href: '/catalogo?fuelType=ELECTRIC', label: 'Vehículos eléctricos' },
      { href: '/catalogo?fuelType=HYBRID', label: 'Híbridos e híbridos enchufables' },
      { href: '/catalogo?bodyType=SUV', label: 'SUV y camionetas' },
      { href: '/catalogo?priceMax=30000', label: 'Desde $30,000' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative mt-px border-t border-line bg-ink-2">
      <div className="container-x grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-4 lg:py-20">
        <div className="lg:col-span-1">
          <div className="text-smoke">
            <Wordmark className="h-7" />
          </div>
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-ash">
            Importación premium de vehículos desde Estados Unidos, Japón, Corea del Sur y Europa.
            Inspección, verificación y entrega llave en mano.
          </p>
          <div className="mt-6 flex gap-2">
            <a
              href={CONTACT_WHATSAPP}
              target="_blank"
              rel="noreferrer"
              className="border border-line px-4 py-2 text-[10px] tracking-[0.2em] text-ash uppercase transition-colors hover:border-signal hover:text-signal"
            >
              WhatsApp
            </a>
            <Link
              href="/login"
              className="border border-line px-4 py-2 text-[10px] tracking-[0.2em] text-ash uppercase transition-colors hover:border-signal hover:text-signal"
            >
              Acceso cliente
            </Link>
          </div>
        </div>

        {columns.map((col) => (
          <div key={col.title}>
            <h4 className="text-[10px] font-semibold tracking-[0.28em] text-signal uppercase">
              {col.title}
            </h4>
            <ul className="mt-5 space-y-3">
              {col.links.map((l) => (
                <li key={l.href + l.label}>
                  <Link
                    href={l.href}
                    className="text-sm text-ash transition-colors duration-300 hover:text-smoke"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div>
          <h4 className="text-[10px] font-semibold tracking-[0.28em] text-signal uppercase">
            Contacto
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
          <span>© {new Date().getFullYear()} JC Autoimport. Todos los derechos reservados.</span>
          <div className="flex gap-6">
            <span>Aviso de privacidad</span>
            <span>Términos y condiciones</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
