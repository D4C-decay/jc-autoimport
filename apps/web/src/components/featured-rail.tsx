'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { flushSync } from 'react-dom';
import { useReducedMotion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import type { VehicleCard } from '@/lib/api';
import { LABELS } from '@/lib/labels';
import { formatMileage, formatPrice } from '@/lib/utils';

/** Seconds a card takes to cross the viewport. Fixed, so the perceived speed does
 *  not change with the number of units. */
const SECONDS_PER_CARD = 1.9;

/**
 * Seamless conveyor for the featured units.
 *
 * The previous version duplicated the whole list and translated it by -50%: the
 * classic CSS-only trick, but it keeps two complete sets of cars on screen and
 * reads as a bug. This one holds N cards plus a single clone and slides the
 * track with rAF. When the first card is fully out, the array is rotated by one
 * and the offset snaps back to 0 in the same commit — a frame that is pixel
 * identical to the one before, so there is no jump and no duplicate set.
 *
 * Per-card emphasis is a `--k` custom property (0..1, distance from the viewport
 * centre) written straight to the DOM, so the loop never re-renders React.
 */
export function FeaturedRail({ vehicles }: { vehicles: VehicleCard[] }) {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  const [narrow, setNarrow] = useState(false);
  // The ring starts populated on purpose: the server has to render the units for
  // SEO, and an empty state here would ship a blank carousel in the static HTML.
  const [items, setItems] = useState<VehicleCard[]>(() =>
    vehicles.length > 1 ? [...vehicles, vehicles[0]] : vehicles,
  );

  const pausedRef = useRef(false);
  const visibleRef = useRef(true);
  const pitchRef = useRef(0);
  const xRef = useRef(0);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);
  const dotRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 639px)');
    const sync = () => setNarrow(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  // Rebuild the ring only when the actual set of units changes, never on a
  // plain re-render (the array identity changes, the ids do not).
  const signature = useMemo(() => vehicles.map((v) => v.id).join(','), [vehicles]);
  useEffect(() => {
    if (vehicles.length === 0) {
      setItems([]);
      return;
    }
    setItems(vehicles.length > 1 ? [...vehicles, vehicles[0]] : vehicles);
    xRef.current = 0;
  }, [signature, vehicles.length]);

  // The server and the first client render must agree, otherwise React reports a
  // hydration mismatch for users who ask for reduced motion. Only after mounting
  // does the manual scroller take over.
  const staticStrip = mounted && (reduceMotion || narrow);
  const looping = !staticStrip && vehicles.length > 1;
  const total = vehicles.length;

  /* ------------------------------ The conveyor ----------------------------- */

  const measure = useCallback(() => {
    const track = trackRef.current;
    if (!track || track.children.length < 2) return;
    // offsetLeft ignores the per-card scale, so this is the true layout pitch.
    const a = track.children[0] as HTMLElement;
    const b = track.children[1] as HTMLElement;
    const pitch = b.offsetLeft - a.offsetLeft;
    if (pitch > 0) pitchRef.current = pitch;
  }, []);

  useEffect(() => {
    if (!looping) return;
    const track = trackRef.current;
    const view = track?.parentElement;
    if (!track || !view) return;

    const ro = new ResizeObserver(() => measure());
    ro.observe(track);
    measure();

    const io = new IntersectionObserver(
      ([entry]) => {
        visibleRef.current = entry.isIntersecting;
      },
      { threshold: 0.05 },
    );
    io.observe(view);

    let raf = 0;
    let last = performance.now();

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.06);
      last = now;
      const pitch = pitchRef.current;

      if (pitch > 0) {
        if (!pausedRef.current && visibleRef.current) {
          const next = xRef.current - (pitch / SECONDS_PER_CARD) * dt;
          if (next <= -pitch) {
            // One card is fully out. Rotate the ring and go back to 0.
            //
            // Both writes have to land in THIS frame, in this order, and both must
            // be synchronous: the ring re-render goes through flushSync, and the
            // transform is written by hand. Letting Framer own the transform
            // breaks it, because it applies the value in its own rAF — the browser
            // then paints the rotated ring at the old offset and the rail jumps
            // one card backwards.
            xRef.current = 0;
            flushSync(() => {
              setItems((prev) => (prev.length > 1 ? [...prev.slice(1), prev[0]] : prev));
            });
          } else {
            xRef.current = next;
          }
        }
        track.style.transform = `translate3d(${xRef.current}px, 0, 0)`;

        // Spotlight: --k per card from its distance to the viewport centre.
        const w = view.clientWidth;
        if (w > 0) {
          const viewLeft = view.getBoundingClientRect().left;
          const centre = -xRef.current + w / 2;
          const fade = w * 0.46;
          for (const el of cardRefs.current) {
            if (!el) continue;
            const r = el.getBoundingClientRect();
            const d = Math.abs(r.left + r.width / 2 - viewLeft - centre);
            const k = Math.max(0, Math.min(1, 1 - d / fade));
            el.style.setProperty('--k', k.toFixed(3));
          }

          const idx = Math.max(
            0,
            Math.min(total - 1, Math.round((centre - pitch / 2) / pitch)),
          );
          for (let i = 0; i < dotRefs.current.length; i++) {
            dotRefs.current[i]?.setAttribute('data-active', String(i === idx));
          }
        }
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, [looping, total, measure]);

  if (vehicles.length === 0) return null;

  return (
    <div className="mt-12">
      <div
        className="overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_4%,#000_96%,transparent)]"
        onMouseEnter={() => {
          pausedRef.current = true;
        }}
        onMouseLeave={() => {
          pausedRef.current = false;
        }}
        onFocusCapture={() => {
          pausedRef.current = true;
        }}
        onBlurCapture={() => {
          pausedRef.current = false;
        }}
      >
        {looping ? (
          <div ref={trackRef} className="flex w-max items-stretch gap-5">
            {items.map((v, i) => {
              const clone = i === items.length - 1 && items.length > 1;
              return (
                <div
                  key={i}
                  ref={(el) => {
                    cardRefs.current[i] = el;
                  }}
                  className="rail-card"
                  aria-hidden={clone || undefined}
                >
                  <RailCard vehicle={v} tabbable={!clone} />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-2">
            {vehicles.map((v) => (
              <div key={v.id} className="w-[80vw] max-w-[24rem] shrink-0 snap-start">
                <RailCard vehicle={v} />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-7 flex items-center justify-between gap-6">
        {looping ? (
          <div className="flex items-center gap-2" aria-hidden>
            {Array.from({ length: vehicles.length }).map((_, i) => (
              <span
                key={i}
                ref={(el) => {
                  dotRefs.current[i] = el;
                }}
                className="rail-dot"
              />
            ))}
          </div>
        ) : (
          <p className="text-[10px] tracking-[0.24em] text-ash/70 uppercase">
            Desliza · {vehicles.length} unidades
          </p>
        )}

        <Link
          href="/catalogo"
          data-cursor="Ver"
          className="group/link inline-flex shrink-0 items-center gap-2 text-[10px] font-semibold tracking-[0.24em] text-smoke uppercase transition-colors hover:text-signal"
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

function RailCard({ vehicle, tabbable = true }: { vehicle: VehicleCard; tabbable?: boolean }) {
  const image = vehicle.primaryImageUrl ?? vehicle.thumbnailUrl ?? vehicle.media?.[0]?.url ?? null;

  return (
    <article className="w-[80vw] max-w-[24rem] sm:w-[24rem]">
      <Link
        href={`/vehiculo/${vehicle.slug}`}
        data-cursor="Ver"
        tabIndex={tabbable ? undefined : -1}
        className="rail-media group/card relative block border border-line bg-ink-2 transition-colors duration-500 hover:border-signal/60"
      >
        <div className="relative aspect-[16/10] overflow-hidden bg-ink-3">
          {image ? (
            <Image
              src={image}
              alt={`${vehicle.brand} ${vehicle.model} ${vehicle.year}`}
              fill
              sizes="(max-width: 640px) 80vw, 24rem"
              className="object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/card:scale-[1.09]"
            />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-t from-ink-2 via-ink-2/20 to-transparent" />

          <span className="absolute top-3 left-3 bg-signal px-2.5 py-1 text-[9px] font-bold tracking-[0.18em] text-ink uppercase">
            Destacado
          </span>

          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4">
            <div className="min-w-0">
              <span className="block text-[9px] font-semibold tracking-[0.26em] text-signal uppercase">
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
      </Link>
    </article>
  );
}
