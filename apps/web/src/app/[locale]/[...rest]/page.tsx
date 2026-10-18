import { notFound } from 'next/navigation';

/** Cualquier ruta desconocida dentro de /[locale] cae en el 404 localizado (ver next-intl: error-files). */
export default function CatchAllPage() {
  notFound();
}
