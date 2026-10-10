'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Car } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Foto de vehiculo con degradacion elegante: si la imagen falta o falla al
 * cargar, se muestra un marcador con el icono de auto en vez de una caja vacia.
 */
export function VehiclePhoto({
  src,
  alt,
  priority = false,
  sizes,
  className,
  fallbackClassName,
}: {
  src: string | null | undefined;
  alt: string;
  priority?: boolean;
  sizes?: string;
  className?: string;
  fallbackClassName?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        aria-label={alt}
        role="img"
        className={cn(
          'absolute inset-0 flex items-center justify-center bg-gradient-to-br from-ink-3 to-ink-2',
          fallbackClassName,
        )}
      >
        <div className="flex flex-col items-center gap-2 text-ash/45">
          <Car className="size-8" strokeWidth={1.3} />
          <span className="text-[9px] tracking-[0.22em] uppercase">Sin imagen</span>
        </div>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      priority={priority}
      sizes={sizes}
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
