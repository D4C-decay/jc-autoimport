'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Fuel, Gauge, Settings2 } from 'lucide-react';
import type { VehicleCard } from '@/lib/api';
import { LABELS } from '@/lib/labels';
import { cn, discountPct, formatMileage, formatPrice } from '@/lib/utils';
import { StatusBadge } from './ui';
import { VehiclePhoto } from './vehicle-photo';

export function VehicleCardItem({
  vehicle,
  index = 0,
  priority = false,
  wide = false,
}: {
  vehicle: VehicleCard;
  index?: number;
  priority?: boolean;
  wide?: boolean;
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
      className={cn('group relative', wide && 'sm:col-span-6')}
    >
      <Link href={`/vehiculo/${vehicle.slug}`} data-cursor="Ver" className="block">
        <div
          className={cn(
            'relative overflow-hidden bg-ink-3',
            wide ? 'aspect-[16/9] lg:aspect-[21/9]' : 'aspect-[4/3]',
          )}
        >
          <VehiclePhoto
            src={image}
            alt={`${vehicle.brand} ${vehicle.model} ${vehicle.year}`}
            priority={priority}
            sizes={
              wide
                ? '(max-width: 640px) 100vw, 100vw'
                : '(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw'
            }
            className="object-cover transition-transform duration-[1100ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.07]"
          />

          <div
            className={cn(
              'absolute inset-0',
              wide
                ? 'bg-gradient-to-t from-ink via-ink/55 to-ink/10'
                : 'bg-gradient-to-t from-ink via-ink/10 to-transparent',
            )}
          />
          <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" style={{ background: 'radial-gradient(120% 90% at 50% 100%, rgba(232,0,13,0.22), transparent 60%)' }} />

          <div className="absolute top-3 left-3 flex flex-wrap gap-2">
            {vehicle.status !== 'AVAILABLE' ? (
              <StatusBadge status={vehicle.status} label={LABELS.status[vehicle.status]} />
            ) : null}
            {off ? (
              <span className="border border-signal/40 bg-signal/15 px-2.5 py-1 text-[9px] font-semibold tracking-[0.18em] text-signal uppercase">
                -{off}%
              </span>
            ) : null}
          </div>

          <div className="absolute right-3 bottom-3 flex items-center gap-1.5 border border-white/12 bg-ink/70 px-2.5 py-1 text-[9px] font-semibold tracking-[0.18em] text-smoke/80 uppercase backdrop-blur-sm">
            {vehicle.countryOfOrigin ?? 'Importado'}
          </div>

          <div className="absolute inset-x-0 bottom-0 translate-y-full px-5 py-4 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-0">
            <span className="block text-[10px] font-semibold tracking-[0.3em] text-signal uppercase">
              Ver ficha →
            </span>
          </div>

          {wide ? (
            <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-end justify-between gap-x-6 gap-y-3 p-5 md:p-7">
              <div className="min-w-0">
                <span className="text-[10px] font-medium tracking-[0.3em] text-signal uppercase">
                  {vehicle.brand}
                </span>
                <h3 className="mt-2 font-display text-2xl leading-[0.95] text-smoke transition-colors duration-300 group-hover:text-signal md:text-4xl">
                  {vehicle.model}
                </h3>
                <p className="mt-2 text-[11px] tracking-wide text-ash">
                  {vehicle.year} · {LABELS.bodyType[vehicle.bodyType]} ·{' '}
                  {LABELS.fuelType[vehicle.fuelType]} · {formatMileage(vehicle.mileage)}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <div className="flex items-baseline justify-end gap-2.5">
                  <span className="font-display text-xl text-smoke md:text-3xl">
                    {formatPrice(vehicle.price)}
                  </span>
                  {vehicle.originalPrice &&
                  Number(vehicle.originalPrice) > Number(vehicle.price) ? (
                    <span className="text-xs text-ash line-through">
                      {formatPrice(vehicle.originalPrice)}
                    </span>
                  ) : null}
                </div>
                <span className="mt-1 block text-[9px] tracking-[0.2em] text-ash uppercase">
                  {vehicle.countryOfOrigin ?? 'Importado'}
                </span>
              </div>
            </div>
          ) : null}
        </div>

        {wide ? null : (
        <div className="relative pt-5">
          <span className="text-[10px] font-medium tracking-[0.28em] text-signal uppercase">
            {vehicle.brand}
          </span>
          <h3 className="mt-1.5 font-display text-xl leading-tight text-smoke transition-colors duration-300 group-hover:text-signal sm:text-2xl">
            {vehicle.model}
          </h3>
          <p className="mt-1 text-xs text-ash">
            {vehicle.year} · {LABELS.bodyType[vehicle.bodyType]} · {vehicle.color}
          </p>

          <ul className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[10px] tracking-wide text-ash">
            <li className="flex items-center gap-1.5">
              <Fuel className="size-3 text-signal/70" strokeWidth={1.6} />
              {LABELS.fuelType[vehicle.fuelType]}
            </li>
            <li className="flex items-center gap-1.5">
              <Gauge className="size-3 text-signal/70" strokeWidth={1.6} />
              {formatMileage(vehicle.mileage)}
            </li>
            <li className="flex items-center gap-1.5">
              <Settings2 className="size-3 text-signal/70" strokeWidth={1.6} />
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
              'absolute -bottom-px left-0 h-px w-0 bg-signal transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]',
              'group-hover:w-full',
            )}
          />
        </div>
        )}
      </Link>
    </motion.article>
  );
}

export function VehicleCardSkeleton({ wide = false }: { wide?: boolean }) {
  return (
    <div className={cn('animate-pulse', wide && 'sm:col-span-6')}>
      <div className={cn('bg-ink-3', wide ? 'aspect-[16/9] lg:aspect-[21/9]' : 'aspect-[4/3]')} />
      <div className="space-y-2.5 pt-5">
        <div className="h-2.5 w-16 bg-ink-3" />
        <div className="h-6 w-40 bg-ink-3" />
        <div className="h-3 w-52 bg-ink-3" />
        <div className="h-5 w-28 bg-ink-3" />
      </div>
    </div>
  );
}

export function VehicleRowSkeleton() {
  return (
    <div className="flex animate-pulse gap-5 border-b border-line py-6">
      <div className="aspect-[16/10] w-40 shrink-0 bg-ink-3 sm:w-56" />
      <div className="flex-1 space-y-3 py-2">
        <div className="h-2.5 w-20 bg-ink-3" />
        <div className="h-6 w-52 bg-ink-3" />
        <div className="h-3 w-72 bg-ink-3" />
        <div className="h-5 w-28 bg-ink-3" />
      </div>
    </div>
  );
}

/* --------------------------------- List row -------------------------------- */

export function VehicleRow({
  vehicle,
  index = 0,
}: {
  vehicle: VehicleCard;
  index?: number;
}) {
  const image =
    vehicle.primaryImageUrl ?? vehicle.thumbnailUrl ?? vehicle.media?.[0]?.url ?? null;
  const off = discountPct(vehicle.price, vehicle.originalPrice);

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-6%' }}
      transition={{ duration: 0.6, delay: Math.min(index * 0.05, 0.3), ease: [0.16, 1, 0.3, 1] }}
      className="group relative border-b border-line"
    >
      <Link
        href={`/vehiculo/${vehicle.slug}`}
        data-cursor="Ver"
        className="flex flex-col gap-5 py-6 sm:flex-row sm:items-center sm:gap-8"
      >
        <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden bg-ink-3 sm:w-56">
          <VehiclePhoto
            src={image}
            alt={`${vehicle.brand} ${vehicle.model} ${vehicle.year}`}
            sizes="(max-width: 640px) 100vw, 14rem"
            className="object-cover transition-transform duration-[1100ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.07]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/70 to-transparent" />
          {vehicle.status !== 'AVAILABLE' ? (
            <div className="absolute top-2 left-2">
              <StatusBadge status={vehicle.status} label={LABELS.status[vehicle.status]} />
            </div>
          ) : null}
          {off ? (
            <span className="absolute right-2 bottom-2 border border-signal/40 bg-signal/15 px-2 py-1 text-[9px] font-semibold tracking-[0.18em] text-signal uppercase">
              -{off}%
            </span>
          ) : null}
        </div>

        <div className="flex min-w-0 flex-1 flex-wrap items-start justify-between gap-x-8 gap-y-4">
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-medium tracking-[0.28em] text-signal uppercase">
              {vehicle.brand}
            </span>
            <h3 className="mt-1.5 font-display text-xl leading-tight text-smoke transition-colors duration-300 group-hover:text-signal sm:text-2xl">
              {vehicle.model}
            </h3>
            <p className="mt-1.5 text-xs text-ash">
              {vehicle.year} · {LABELS.bodyType[vehicle.bodyType]} · {vehicle.color} ·{' '}
              {vehicle.countryOfOrigin ?? 'Importado'}
            </p>
            <ul className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[10px] tracking-wide text-ash">
              <li className="flex items-center gap-1.5">
                <Fuel className="size-3 text-signal/70" strokeWidth={1.6} />
                {LABELS.fuelType[vehicle.fuelType]}
              </li>
              <li className="flex items-center gap-1.5">
                <Gauge className="size-3 text-signal/70" strokeWidth={1.6} />
                {formatMileage(vehicle.mileage)}
              </li>
              <li className="flex items-center gap-1.5">
                <Settings2 className="size-3 text-signal/70" strokeWidth={1.6} />
                {LABELS.transmission[vehicle.transmission]}
              </li>
            </ul>
          </div>

          <div className="shrink-0 text-left sm:text-right">
            <div className="flex items-baseline gap-2.5 sm:justify-end">
              <span className="font-display text-xl text-smoke">{formatPrice(vehicle.price)}</span>
              {vehicle.originalPrice && Number(vehicle.originalPrice) > Number(vehicle.price) ? (
                <span className="text-xs text-ash line-through">
                  {formatPrice(vehicle.originalPrice)}
                </span>
              ) : null}
            </div>
            <span className="mt-2 inline-flex items-center gap-1.5 text-[9px] font-semibold tracking-[0.2em] text-signal uppercase opacity-0 transition-opacity duration-500 group-hover:opacity-100">
              Ver ficha
              <ArrowRight className="size-3" strokeWidth={1.8} />
            </span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
