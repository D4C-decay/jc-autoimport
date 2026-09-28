'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Calendar,
  Check,
  ChevronRight,
  DoorOpen,
  Fuel,
  Gauge,
  Globe2,
  Hash,
  Palette,
  Settings2,
  Users,
  Zap,
} from 'lucide-react';
import type { MediaItem, VehicleDetail } from '@/lib/api';
import { LABELS } from '@/lib/labels';
import { cn, discountPct, formatMileage, formatPrice } from '@/lib/utils';
import { Button, Eyebrow, StatusBadge } from './ui';
import { Reveal, SplitWords } from './motion';
import { LeadForm } from './lead-form';

const FUEL_ICON: Record<string, typeof Fuel> = {
  ELECTRIC: Zap,
  PLUGIN_HYBRID: Zap,
  HYBRID: Fuel,
  GASOLINE: Fuel,
  DIESEL: Fuel,
  GAS: Fuel,
};

export function VehicleDetailPage({ vehicle }: { vehicle: VehicleDetail }) {
  const [active, setActive] = useState(0);
  const gallery: MediaItem[] = vehicle.media?.length
    ? vehicle.media
    : vehicle.primaryImageUrl
      ? [
          {
            id: 'primary',
            type: 'IMAGE',
            url: vehicle.primaryImageUrl,
            thumbnailUrl: vehicle.thumbnailUrl ?? null,
            altText: null,
            sortOrder: 0,
            isPrimary: true,
          },
        ]
      : [];

  const off = discountPct(vehicle.price, vehicle.originalPrice);
  const FuelIcon = FUEL_ICON[vehicle.fuelType] ?? Fuel;

  const specs = vehicle.specifications ?? [];
  const grouped = specs.reduce<Record<string, typeof specs>>((acc, s) => {
    const cat = s.specification.category;
    (acc[cat] ??= []).push(s);
    return acc;
  }, {});

  const quickFacts = [
    { icon: Gauge, label: 'Potencia', value: `${vehicle.horsepower} HP` },
    { icon: FuelIcon, label: 'Combustible', value: LABELS.fuelType[vehicle.fuelType] },
    { icon: Settings2, label: 'Transmisión', value: LABELS.transmission[vehicle.transmission] },
    { icon: Globe2, label: 'Tracción', value: LABELS.driveType[vehicle.driveType] },
    { icon: Calendar, label: 'Año', value: String(vehicle.year) },
    { icon: Gauge, label: 'Kilometraje', value: formatMileage(vehicle.mileage) },
    { icon: DoorOpen, label: 'Carrocería', value: LABELS.bodyType[vehicle.bodyType] },
    { icon: Users, label: 'Asientos', value: String(vehicle.seats) },
    {
      icon: Settings2,
      label: 'Motor',
      value: Number(vehicle.engineSize) > 0 ? `${vehicle.engineSize} L` : 'Eléctrico',
    },
    { icon: Palette, label: 'Color ext.', value: vehicle.color },
    { icon: Palette, label: 'Color int.', value: vehicle.interiorColor ?? '—' },
    { icon: DoorOpen, label: 'Puertas', value: String(vehicle.doors) },
  ];

  return (
    <>
      {/* ============================== HERO / GALLERY ============================== */}
      <section className="relative pt-18">
        <div className="container-x pt-8">
          <Link
            href="/catalogo"
            className="group inline-flex items-center gap-2 text-[10px] tracking-[0.22em] text-ash uppercase transition-colors hover:text-signal"
          >
            <ArrowLeft
              className="size-3.5 transition-transform duration-500 group-hover:-translate-x-1"
              strokeWidth={1.7}
            />
            Volver al catálogo
          </Link>
        </div>

        <div className="container-x mt-6 grid gap-3 lg:grid-cols-[1.65fr_1fr]">
          <div className="relative aspect-4/3 overflow-hidden bg-ink-3 lg:aspect-16/10">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, scale: 1.03 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="absolute inset-0"
              >
                {gallery[active] ? (
                  <Image
                    src={gallery[active].url}
                    alt={gallery[active].altText ?? `${vehicle.brand} ${vehicle.model}`}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 66vw"
                    className="object-cover"
                  />
                ) : null}
              </motion.div>
            </AnimatePresence>
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" />
            {vehicle.status !== 'AVAILABLE' ? (
              <div className="absolute top-4 left-4">
                <StatusBadge status={vehicle.status} label={LABELS.status[vehicle.status]} />
              </div>
            ) : null}
          </div>

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-1">
            {gallery.slice(1, 3).map((m, i) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setActive(i + 1)}
                data-cursor="Ver"
                className={cn(
                  'group relative aspect-16/10 overflow-hidden bg-ink-3 text-left transition-opacity duration-500',
                  active === i + 1 ? 'ring-1 ring-signal' : 'opacity-65 hover:opacity-100',
                )}
              >
                <Image
                  src={m.url}
                  alt={m.altText ?? `${vehicle.brand} ${vehicle.model} ${i + 2}`}
                  fill
                  sizes="(max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-[1100ms] group-hover:scale-105"
                />
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ============================== TITLE + PRICE ============================== */}
      <section className="container-x pt-12 lg:pt-16">
        <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr]">
          <div>
            <Eyebrow index={vehicle.countryOfOrigin ?? 'Importado'}>
              {vehicle.brand} · {LABELS.bodyType[vehicle.bodyType]}
            </Eyebrow>
            <h1 className="mt-5 font-display text-[clamp(2rem,5.5vw,4.5rem)] leading-[0.9] text-smoke">
              <SplitWords text={vehicle.model} />
            </h1>
            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-ash">
              <span className="flex items-center gap-2">
                <Hash className="size-3.5 text-signal" strokeWidth={1.7} /> VIN {vehicle.vin}
              </span>
              {vehicle.portOfEntry ? (
                <span className="flex items-center gap-2">
                  <Globe2 className="size-3.5 text-signal" strokeWidth={1.7} /> Puerto{' '}
                  {vehicle.portOfEntry}
                </span>
              ) : null}
              {vehicle.importDate ? (
                <span className="flex items-center gap-2">
                  <Calendar className="size-3.5 text-signal" strokeWidth={1.7} /> Importado{' '}
                  {new Date(vehicle.importDate).toLocaleDateString('es-DO', {
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              ) : null}
            </div>

            {vehicle.description ? (
              <p className="mt-7 max-w-2xl text-sm leading-relaxed text-ash md:text-[15px]">
                {vehicle.description}
              </p>
            ) : null}

            {vehicle.features?.length ? (
              <ul className="mt-8 flex flex-wrap gap-2">
                {vehicle.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-center gap-1.5 border border-line px-3 py-1.5 text-[11px] text-ash"
                  >
                    <Check className="size-3 text-signal" strokeWidth={2.2} />
                    {f}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          {/* Sticky price card */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="border border-line bg-ink-2 p-7">
              <div className="text-[10px] font-semibold tracking-[0.24em] text-ash uppercase">
                Precio de venta
              </div>
              <div className="mt-3 flex flex-wrap items-baseline gap-3">
                <span className="font-display text-4xl text-smoke">
                  {formatPrice(vehicle.price)}
                </span>
                {vehicle.originalPrice && off ? (
                  <span className="text-sm text-ash line-through">
                    {formatPrice(vehicle.originalPrice)}
                  </span>
                ) : null}
              </div>
              {off ? (
                <div className="mt-3 inline-block border border-signal/40 bg-signal/12 px-3 py-1 text-[10px] font-semibold tracking-[0.18em] text-signal uppercase">
                  Ahorro {off}% sobre precio de lista
                </div>
              ) : null}
              <p className="mt-4 text-[11px] leading-relaxed text-ash">
                Precio final en destino. Incluye importación, nacionalización, taller y matrícula. No
                incluye placas de lujo si aplican según el modelo.
              </p>

              <div className="mt-7 flex flex-col gap-3">
                <LeadForm
                  vehicleId={vehicle.id}
                  vehicleName={`${vehicle.brand} ${vehicle.model}`}
                  defaultType="QUOTATION"
                  cta="Reservar este vehículo"
                />
                <Button href="/contacto" variant="outline" className="w-full">
                  Agendar prueba de manejo
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================== QUICK FACTS ============================== */}
      <section className="container-x mt-16 lg:mt-24">
        <Reveal>
          <h2 className="font-display text-2xl text-smoke lg:text-3xl">Ficha técnica</h2>
        </Reveal>
        <dl className="mt-8 grid gap-px bg-line sm:grid-cols-2 lg:grid-cols-4">
          {quickFacts.map((f, i) => (
            <Reveal key={f.label} delay={i * 0.03}>
              <div className="flex items-start gap-4 bg-ink-2 p-5 transition-colors duration-500 hover:bg-ink-3">
                <f.icon className="mt-0.5 size-4 shrink-0 text-signal" strokeWidth={1.6} />
                <div className="min-w-0">
                  <dt className="text-[9px] font-semibold tracking-[0.22em] text-ash uppercase">
                    {f.label}
                  </dt>
                  <dd className="mt-1 truncate text-sm text-smoke">{f.value}</dd>
                </div>
              </div>
            </Reveal>
          ))}
        </dl>
      </section>

      {/* ============================== SPECIFICATIONS ============================== */}
      {Object.keys(grouped).length > 0 ? (
        <section className="container-x mt-16 lg:mt-24">
          <Reveal>
            <h2 className="font-display text-2xl text-smoke lg:text-3xl">Equipamiento</h2>
          </Reveal>
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Object.entries(grouped).map(([cat, items], gi) => (
              <Reveal key={cat} delay={gi * 0.08}>
                <div className="border border-line p-6">
                  <h3 className="text-[10px] font-semibold tracking-[0.24em] text-signal uppercase">
                    {cat}
                  </h3>
                  <ul className="mt-5 space-y-3">
                    {items.map((s) => (
                      <li key={s.id} className="flex items-center justify-between gap-3 text-sm">
                        <span className="text-ash">{s.specification.name}</span>
                        <span className="flex items-center gap-1.5 text-right text-smoke">
                          {s.value}
                          <ChevronRight className="size-3 text-ash/40" strokeWidth={1.6} />
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      ) : null}

      {/* ============================== BOTTOM CTA ============================== */}
      <section className="container-x mt-20 lg:mt-28">
        <div className="relative overflow-hidden border border-line px-6 py-14 text-center md:px-16">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-15"
            style={{
              backgroundImage: `url(${vehicle.primaryImageUrl ?? ''})`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/85 to-ink" />
          <div className="relative">
            <h2 className="mx-auto max-w-[20ch] font-display text-[clamp(1.6rem,4vw,3rem)] leading-[0.95] text-smoke">
              ¿Quieres ver esta unidad en persona?
            </h2>
            <p className="mx-auto mt-4 max-w-md text-sm text-ash">
              Agenda una cita de inspección o reserva tu unidad con un depósito reembolsable de 72 horas.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button href="/contacto">Agendar inspección</Button>
              <Button href="/catalogo" variant="outline">
                Seguir explorando
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
