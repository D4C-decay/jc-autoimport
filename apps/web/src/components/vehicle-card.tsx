'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Fuel, Gauge, Settings2 } from 'lucide-react';
import type { VehicleCard } from '@/lib/api';
import { LABELS } from '@/lib/labels';
import { cn, discountPct, formatMileage, formatPrice } from '@/lib/utils';
import { StatusBadge } from './ui';

export function VehicleCardItem({
  vehicle,
  index = 0,
  priority = false,
}: {
  vehicle: VehicleCard;
  index?: number;
  priority?: boolean;
}) {
  const image =
    vehicle.primaryImageUrl ?? vehicle.thumbnailUrl ?? vehicle.media?.[0]?.url ?? null;
  const off = discountPct(vehicle.price, vehicle.originalPrice);

  return (
    <motion.article
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-8%' }}
      transition={{ duration: 0.75, delay: Math.min(index * 0.07, 0.4), ease: [0.16, 1, 0.3, 1] }}
      className="group relative"
    >
      <Link href={`/vehiculo/${vehicle.slug}`} data-cursor="Ver" className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-ink-3">
          {image ? (
            <Image
              src={image}
              alt={`${vehicle.brand} ${vehicle.model} ${vehicle.year}`}
              fill
              priority={priority}
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
              className="object-cover transition-transform duration-[1100ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.07]"
            />
          ) : null}

          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/10 to-transparent" />
          <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" style={{ background: 'radial-gradient(120% 90% at 50% 100%, rgba(201,162,39,0.22), transparent 60%)' }} />

          <div className="absolute top-3 left-3 flex flex-wrap gap-2">
            {vehicle.status !== 'AVAILABLE' ? (
              <StatusBadge status={vehicle.status} label={LABELS.status[vehicle.status]} />
            ) : null}
            {off ? (
              <span className="border border-brass/40 bg-brass/15 px-2.5 py-1 text-[9px] font-semibold tracking-[0.18em] text-brass uppercase">
                -{off}%
              </span>
            ) : null}
          </div>

          <div className="absolute right-3 bottom-3 flex items-center gap-1.5 border border-white/12 bg-ink/70 px-2.5 py-1 text-[9px] font-semibold tracking-[0.18em] text-smoke/80 uppercase backdrop-blur-sm">
            {vehicle.countryOfOrigin ?? 'Importado'}
          </div>

          <div className="absolute inset-x-0 bottom-0 translate-y-full px-5 py-4 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-0">
            <span className="block text-[10px] font-semibold tracking-[0.3em] text-brass uppercase">
              Ver ficha →
            </span>
          </div>
        </div>

        <div className="relative pt-5">
          <span className="text-[10px] font-medium tracking-[0.28em] text-brass uppercase">
            {vehicle.brand}
          </span>
          <h3 className="mt-1.5 font-display text-xl leading-tight text-smoke transition-colors duration-300 group-hover:text-brass sm:text-2xl">
            {vehicle.model}
          </h3>
          <p className="mt-1 text-xs text-ash">
            {vehicle.year} · {LABELS.bodyType[vehicle.bodyType]} · {vehicle.color}
          </p>

          <ul className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[10px] tracking-wide text-ash">
            <li className="flex items-center gap-1.5">
              <Fuel className="size-3 text-brass/70" strokeWidth={1.6} />
              {LABELS.fuelType[vehicle.fuelType]}
            </li>
            <li className="flex items-center gap-1.5">
              <Gauge className="size-3 text-brass/70" strokeWidth={1.6} />
              {formatMileage(vehicle.mileage)}
            </li>
            <li className="flex items-center gap-1.5">
              <Settings2 className="size-3 text-brass/70" strokeWidth={1.6} />
              {LABELS.transmission[vehicle.transmission]}
            </li>
          </ul>

          <div className="mt-4 flex items-baseline gap-2.5 border-t border-line pt-4">
            <span className="font-display text-lg text-smoke sm:text-xl">
              {formatPrice(vehicle.price)}
            </span>
            {vehicle.originalPrice && Number(vehicle.originalPrice) > Number(vehicle.price) ? (
              <span className="text-xs text-ash line-through">
                {formatPrice(vehicle.originalPrice)}
              </span>
            ) : null}
          </div>

          <span
            aria-hidden
            className={cn(
              'absolute -bottom-px left-0 h-px w-0 bg-brass transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]',
              'group-hover:w-full',
            )}
          />
        </div>
      </Link>
    </motion.article>
  );
}

export function VehicleCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[4/3] bg-ink-3" />
      <div className="space-y-2.5 pt-5">
        <div className="h-2.5 w-16 bg-ink-3" />
        <div className="h-6 w-40 bg-ink-3" />
        <div className="h-3 w-52 bg-ink-3" />
        <div className="h-5 w-28 bg-ink-3" />
      </div>
    </div>
  );
}
