'use client';

import { useEffect, useRef } from 'react';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Aviso de error accesible para los formularios de autenticación.
 *
 * - `role="alert"` + `aria-live="assertive"`: los lectores de pantalla lo
 *   anuncian en cuanto aparece.
 * - Recibe el foco al montarse para que el error no pase desapercibido a quien
 *   navega con teclado (con `preventScroll` para no saltar la página).
 * - El color sale de `--color-danger`, que cumple AA en claro y oscuro.
 *
 * Pasa el mismo `id` al `aria-describedby` del input y marca el input con
 * `aria-invalid` cuando haya error.
 */
export function AuthErrorNote({
  children,
  id,
  className,
}: {
  children: React.ReactNode;
  id?: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref.current?.focus({ preventScroll: true });
  }, []);

  return (
    <div
      ref={ref}
      id={id}
      role="alert"
      aria-live="assertive"
      tabIndex={-1}
      className={cn(
        'mt-5 flex items-start gap-2.5 border border-danger/35 bg-danger/10 px-4 py-3 text-[13px] leading-relaxed text-danger',
        className,
      )}
    >
      <AlertCircle className="mt-0.5 size-4 shrink-0" strokeWidth={1.9} aria-hidden />
      <div>{children}</div>
    </div>
  );
}
