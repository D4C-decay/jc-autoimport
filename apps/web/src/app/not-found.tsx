import Link from 'next/link';
import { Button, Eyebrow } from '@/components/ui';

export default function NotFound() {
  return (
    <section className="flex min-h-[80svh] items-center pt-18">
      <div className="container-x text-center">
        <Eyebrow className="justify-center">Error 404</Eyebrow>
        <h1 className="mt-6 font-display text-[clamp(3rem,12vw,9rem)] leading-[0.85] text-smoke">
          <span className="text-brass">404</span>
        </h1>
        <p className="mx-auto mt-6 max-w-md text-sm text-ash">
          Esta unidad no está en nuestro inventario. Puede que ya haya sido vendida o que la dirección
          sea incorrecta.
        </p>
        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button href="/catalogo">Ir al catálogo</Button>
          <Link
            href="/contacto"
            className="text-[11px] tracking-[0.24em] text-ash uppercase transition-colors hover:text-brass"
          >
            Buscar por encargo →
          </Link>
        </div>
      </div>
    </section>
  );
}
