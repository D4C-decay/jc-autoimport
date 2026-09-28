'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import type { VehicleCard } from '@/lib/api';
import { LABELS } from '@/lib/labels';
import { formatMileage, formatPrice } from '@/lib/utils';

/**
 * Infinite horizontal rail for the featured units.
 *
 * The list is rendered twice and the whole track is translated by exactly -50%,
 * so when the animation restarts the second copy is pixel-aligned with where the
 * first one started. Duration is derived from the item count, which keeps the
 * apparent speed constant no matter how many featured units the API returns.
 */
export function FeaturedRail({ vehicles }: { vehicles: VehicleCard[] }) {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // ~9 s of travel per item keeps the speed steady instead of stretching the loop
  // when there are only a handful of featured vehicles.
  const duration = useMemo(() => Math.max(28, vehicles.length * 9), [vehicles.length]);

  // The server and the first client render must agree, otherwise React reports a
  // hydration mismatch for users who ask for reduced motion. Only after mounting
  // do we swap the animated rail for the manual scroller.
  const staticStrip = mounted && reduceMotion;

  if (vehicles.length === 0) return null;

  const track = (
    <div className="flex w-max shrink-0 items-stretch gap-5 pr-5">
      {vehicles.map((v) => (
        <RailCard key={v.id} vehicle={v} />
      ))}
    </div>
  );

  return (
    <div className="group/rail relative mt-12">
      <div
        className="overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_6%,#000_94%,transparent)]"
        style={{ cursor: staticStrip ? 'auto' : 'grab' }}
      >
        {staticStrip ? (
          // No animation: a native, swipeable scroller instead of a frozen strip.
          <div className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-2">
            {vehicles.map((v) => (
              <div key={v.id} className="w-[78vw] max-w-[22rem] shrink-0 snap-start">
                <RailCard vehicle={v} />
              </div>
            ))}
          </div>
        ) : (
          <div
            className="animate-rail hover:[animation-play-state:paused]"
            style={{ animationDuration: `${duration}s` }}
          >
            {track}
            <div aria-hidden className="flex w-max shrink-0 items-stretch gap-5 pr-5">
              {vehicles.map((v) => (
                <RailCard key={`dup-${v.id}`} vehicle={v} />
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="pointer-events-none mt-6 flex items-center justify-between gap-4">
        <p className="text-[10px] tracking-[0.24em] text-ash/70 uppercase">
          Desliza o pasa el cursor · bucle continuo
        </p>
        <Link
          href="/catalogo"
          data-cursor="Ver"
          className="pointer-events-auto group/link inline-flex items-center gap-2 text-[10px] font-semibold tracking-[0.24em] text-smoke uppercase transition-colors hover:text-brass"
        >
          Ver las {vehicles.length} unidades
          <ArrowUpRight
            className="size-3.5 transition-transform duration-500 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5"
            strokeWidth={1.8}
          />
        </Link>
      </div>
    </div>
  );
}

/* --------------------------------- Card --------------------------------- */

function RailCard({ vehicle }: { vehicle: VehicleCard }) {
  const image = vehicle.primaryImageUrl ?? vehicle.thumbnailUrl ?? vehicle.media?.[0]?.url ?? null;

  return (
    <motion.article
      whileHover={{ y: -6 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="group/card relative w-[78vw] max-w-[22rem] shrink-0 sm:w-[22rem]"
    >
      <Link
        href={`/vehiculo/${vehicle.slug}`}
        data-cursor="Ver"
        className="block border border-line bg-ink-2 transition-colors duration-500 hover:border-brass/45"
      >
        <div className="relative aspect-[16/10] overflow-hidden bg-ink-3">
          {image ? (
            <Image
              src={image}
              alt={`${vehicle.brand} ${vehicle.model} ${vehicle.year}`}
              fill
              sizes="(max-width: 640px) 78vw, 22rem"
              className="object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/card:scale-[1.08]"
            />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-t from-ink-2 via-ink-2/25 to-transparent" />

          <span className="absolute top-3 left-3 border border-white/12 bg-ink/70 px-2.5 py-1 text-[9px] font-semibold tracking-[0.18em] text-smoke/85 uppercase backdrop-blur-sm">
            {vehicle.countryOfOrigin ?? 'Importado'}
          </span>

          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4">
            <div className="min-w-0">
              <span className="block text-[9px] font-medium tracking-[0.26em] text-brass uppercase">
                {vehicle.brand}
              </span>
              <h3 className="mt-1 truncate font-display text-lg text-smoke">{vehicle.model}</h3>
            </div>
            <span className="shrink-0 font-display text-base text-smoke">
              {formatPrice(vehicle.price)}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 px-4 py-3 text-[10px] tracking-[0.14em] text-ash uppercase">
          <span>{vehicle.year}</span>
          <span className="size-1 rounded-full bg-line" />
          <span>{LABELS.bodyType[vehicle.bodyType]}</span>
          <span className="size-1 rounded-full bg-line" />
          <span>{formatMileage(vehicle.mileage)}</span>
        </div>

        <span
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-brass transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/card:scale-x-100"
        />
      </Link>
    </motion.article>
  );
}
