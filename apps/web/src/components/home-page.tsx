'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowDown, ArrowRight, ShieldCheck, Ship, Sparkles } from 'lucide-react';
import { api, type VehicleCard } from '@/lib/api';
import { Button, Eyebrow } from '@/components/ui';
import { Counter, Magnetic, Reveal, SectionLabel, SplitWords } from '@/components/motion';
import { SearchBar } from '@/components/search-bar';
import { HeroVideo } from '@/components/hero-video';
import { FeaturedRail } from '@/components/featured-rail';

const BRANDS = [
  'Porsche', 'Mercedes-Benz', 'BMW', 'Audi', 'Tesla', 'Toyota',
  'Ford', 'Chevrolet', 'Jeep', 'Land Rover', 'Lexus', 'Genesis',
  'Nissan', 'Honda', 'Hyundai', 'Kia', 'Mazda', 'GMC',
];

const STATS = [
  { value: 480, suffix: '+', label: 'Vehículos importados' },
  { value: 14, suffix: ' años', label: 'Trayectoria' },
  { value: 98, suffix: '%', label: 'Clientes conformes' },
  { value: 5, suffix: ' orígenes', label: 'EE.UU. · Japón ·Corea ·Europa' },
];

const PROCESS = [
  {
    n: '01',
    title: 'Selección',
    text: 'Recibe tu ficha técnica o busca por nuestro catálogo verificado. Filtra por marca, precio, año y configuración.',
  },
  {
    n: '02',
    title: 'Inspección',
    text: 'Nuestro equipo en origen revisa VIN, historial de accidentes, espesor de pintura y prueba de ruta. Solo pasa lo impecable.',
  },
  {
    n: '03',
    title: 'Compra y embarque',
    text: 'Pago seguro y aprobación de crédito en 48 h. Embarque en contenedor con seguro de carga completo y rastreo en tiempo real.',
  },
  {
    n: '04',
    title: 'Aduanas y taller',
    text: 'Gestión de nacionalización, despacho y documentación. Inspección técnica y corrección de cualquier detalle si aplica.',
  },
  {
    n: '05',
    title: 'Entrega llave en mano',
    text: 'Matrícula, placas y entrega en tu domicilio o en nuestras instalaciones. garantía mecánica de 90 días.',
  },
];

const PILLARS = [
  {
    icon: ShieldCheck,
    title: 'Inspección de 120 puntos',
    text: 'Cada unidad pasa por una revisión exhaustiva en origen: estructura, pintura, tren motriz y electrónica.',
  },
  {
    icon: Ship,
    title: 'Logística propia completa',
    text: 'De la compra en el puerto de origen hasta la entrega en tu garaje. Un solo interlocutor, un solo costo.',
  },
  {
    icon: Sparkles,
    title: 'Garantía mecánica',
    text: '90 días de garantía o 5,000 km en motor y transmisión. transparencia total en cada factura.',
  },
];

export function HomePage({ initialFeatured }: { initialFeatured: VehicleCard[] }) {
  const [featured, setFeatured] = useState<VehicleCard[]>(initialFeatured);
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 900], [0, 220]);
  const heroOpacity = useTransform(scrollY, [0, 620], [1, 0]);
  const heroScale = useTransform(scrollY, [0, 900], [1, 1.14]);

  useEffect(() => {
    if (initialFeatured.length > 0) return;
    let alive = true;
    api
      .featuredVehicles(6)
      .then((v) => alive && setFeatured(v))
      .catch(() => alive && setFeatured([]));
    return () => {
      alive = false;
    };
  }, [initialFeatured.length]);

  return (
    <>
      {/* ============================== HERO ============================== */}
      <section className="grain relative flex min-h-[100svh] items-end overflow-hidden pt-18">
        <motion.div
          style={{ y: heroY, scale: heroScale }}
          className="absolute inset-0 will-change-transform"
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage:
                'url(/media/backgrounds/bg-photo-1503376780353-7e6692767b70.webp)',
            }}
          />
          <HeroVideo
            src="/media/hero-loop.mp4"
            poster="/media/hero-poster.jpg"
            alt="Vehículo deportivo en movimiento"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-ink/45 via-ink/20 to-ink/95" />
          <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/20 to-ink/55" />
        </motion.div>

        <motion.div
          style={{ opacity: heroOpacity }}
          className="container-x relative z-10 w-full pb-16 md:pb-24"
        >
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          >
            <Eyebrow index="EST. 2011">Importación premium de vehículos</Eyebrow>
          </motion.div>

          <h1 className="mt-7 max-w-[16ch] font-display text-[clamp(2.6rem,9vw,8.5rem)] leading-[0.86] tracking-[-0.02em] text-smoke">
            <SplitWords text="El mundo," delay={0.3} />
            <br />
            <SplitWords text="a tu garaje." delay={0.45} className="text-signal" />
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.85, ease: [0.16, 1, 0.3, 1] }}
            className="mt-7 max-w-xl text-sm leading-relaxed text-ash md:text-base"
          >
            Vehículos premium importados de{' '}
            <span className="text-smoke">Estados Unidos, Japón, Corea y Europa</span>. Inspección de
            120 puntos, logística propia y entrega llave en mano.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 1, ease: [0.16, 1, 0.3, 1] }}
            className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center"
          >
            <Magnetic>
              <Button href="/catalogo" cursor="Abrir">
                Explorar catálogo
              </Button>
            </Magnetic>
            <Button href="/proceso" variant="outline" cursor="Cómo">
              Cómo funciona
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.25 }}
            className="mt-14 max-w-md"
          >
            <SearchBar placeholder="Busca «Porsche», «SUV hybrid», «Tesla»…" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.5 }}
            className="mt-16 flex items-center gap-3 text-ash"
          >
            <motion.span
              animate={{ y: [0, 7, 0] }}
              transition={{ duration: 1.9, repeat: Infinity, ease: 'easeInOut' }}
            >
              <ArrowDown className="size-4" strokeWidth={1.5} />
            </motion.span>
            <span className="text-[10px] tracking-[0.3em] uppercase">Desliza</span>
          </motion.div>
        </motion.div>
      </section>

      {/* ============================== MARQUES ============================== */}
      <section className="border-y border-line bg-ink-2 py-6">
        <div className="flex overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)]">
          <div className="animate-marquee flex shrink-0 items-center gap-14 pr-14">
            {[...BRANDS, ...BRANDS].map((b, i) => (
              <span
                key={`${b}-${i}`}
                className="whitespace-nowrap font-display text-lg tracking-tight text-ash/45 uppercase transition-colors duration-500 hover:text-signal sm:text-2xl"
              >
                {b}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ============================== STATS ============================== */}
      <section className="border-b border-line">
        <div className="container-x grid grid-cols-2 divide-line lg:grid-cols-4 lg:divide-x">
          {STATS.map((s, i) => (
            <Reveal
              key={s.label}
              delay={i * 0.08}
              className="border-line py-10 odd:border-r lg:border-r lg:last:border-r-0 lg:py-14"
            >
              <div className="px-4 text-center lg:px-8 lg:text-left">
                <div className="font-display text-3xl text-smoke sm:text-4xl lg:text-5xl">
                  <Counter to={s.value} suffix={s.suffix} />
                </div>
                <p className="mt-2 text-[10px] tracking-[0.22em] text-ash uppercase">{s.label}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ============================== DESTACADOS ============================== */}
      <section className="relative py-20 lg:py-28">
        <div className="container-x">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <SectionLabel index="01">Selección de la casa</SectionLabel>
              <h2 className="mt-5 max-w-[14ch] font-display text-[clamp(2rem,5vw,4.2rem)] leading-[0.9] text-smoke">
                Vehículos <span className="text-signal">destacados</span>
              </h2>
            </div>
            <Reveal delay={0.15}>
              <Link
                href="/catalogo"
                className="group inline-flex items-center gap-2.5 text-[11px] font-semibold tracking-[0.24em] text-smoke uppercase transition-colors hover:text-signal"
              >
                Ver todo el catálogo
                <ArrowRight
                  className="size-4 transition-transform duration-500 group-hover:translate-x-1.5"
                  strokeWidth={1.6}
                />
              </Link>
            </Reveal>
          </div>

          {featured.length === 0 ? (
            <div className="mt-12 flex gap-5 overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_6%,#000_94%,transparent)]">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="w-[78vw] max-w-[22rem] shrink-0 sm:w-[22rem]">
                  <div className="aspect-[16/10] animate-pulse bg-ink-3" />
                  <div className="mt-3 h-3 w-24 animate-pulse bg-ink-3" />
                </div>
              ))}
            </div>
          ) : (
            <FeaturedRail vehicles={featured} />
          )}
        </div>
      </section>

      {/* ============================== PROCESO ============================== */}
      <section className="relative clip-slant-sm border-y border-line bg-ink-2 py-24 lg:py-32">
        <div className="container-x">
          <div className="max-w-2xl">
            <SectionLabel index="02">De cualquier parte del mundo</SectionLabel>
            <h2 className="mt-5 font-display text-[clamp(2rem,5vw,4.2rem)] leading-[0.9] text-smoke">
              No importamos autos.
              <br />
              <span className="text-signal">Eliminamos fronteras.</span>
            </h2>
            <p className="mt-6 text-sm leading-relaxed text-ash">
              Convertimos una compra internacional compleja en una ruta clara: selección,
              verificación, compra bancarizada, embarque, aduanas, taller, matrícula y entrega. Un solo
              equipo coordina toda la operación.
            </p>
          </div>

          <ol className="mt-16 grid gap-px bg-line md:grid-cols-2 lg:grid-cols-5">
            {PROCESS.map((p, i) => (
              <Reveal key={p.n} delay={i * 0.07}>
                <li className="group h-full bg-ink-2 p-7 transition-colors duration-500 hover:bg-ink-3 lg:p-8">
                  <div className="flex items-baseline justify-between">
                    <span className="font-display text-3xl text-signal/30 transition-colors duration-500 group-hover:text-signal">
                      {p.n}
                    </span>
                    <span className="h-px w-8 bg-line transition-all duration-500 group-hover:w-14 group-hover:bg-signal" />
                  </div>
                  <h3 className="mt-6 font-display text-lg text-smoke">{p.title}</h3>
                  <p className="mt-3 text-[13px] leading-relaxed text-ash">{p.text}</p>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* ============================== PILARES ============================== */}
      <section className="py-20 lg:py-28">
        <div className="container-x">
          <div className="grid gap-10 lg:grid-cols-3">
            {PILLARS.map((p, i) => (
              <Reveal key={p.title} delay={i * 0.1}>
                <div className="group relative border border-line p-8 transition-colors duration-500 hover:border-signal/40">
                  <div className="absolute inset-x-0 top-0 h-px origin-left scale-x-0 bg-signal transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100" />
                  <p.icon
                    className="size-8 text-signal"
                    strokeWidth={1.2}
                  />
                  <h3 className="mt-6 font-display text-xl text-smoke">{p.title}</h3>
                  <p className="mt-3 text-[13px] leading-relaxed text-ash">{p.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============================== TESTIMONIOS ============================== */}
      <section className="border-y border-line bg-ink-2 py-20 lg:py-28">
        <div className="container-x">
          <SectionLabel index="03">Lo que dicen nuestros clientes</SectionLabel>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              {
                quote:
                  'Buscaba un Tacoma específico durante 8 meses. JC lo encontró, lo inspeccionó y me lo entregaron matriculado en casa. Servicio impecable.',
                name: 'Rafael Ureña',
                role: 'Toyota Tacoma TRD Pro',
              },
              {
                quote:
                  'Me Cotizaban 3 importadoras y solo JC me envió fotos del VIN, historial de pintura y video de prueba de ruta antes de pagar.',
                name: 'María Fernanda Santos',
                role: 'Porsche Macan GTS',
              },
              {
                quote:
                  'El seguimiento fue constante por WhatsApp en cada etapa. Sabía exactamente dónde estaba mi auto y cuándo llegaría.',
                name: 'Andrés Batista',
                role: 'Tesla Model S Plaid',
              },
            ].map((t, i) => (
              <Reveal key={t.name} delay={i * 0.1}>
                <figure className="flex h-full flex-col justify-between border border-line p-8">
                  <blockquote className="text-sm leading-relaxed text-smoke/90">
                    «{t.quote}»
                  </blockquote>
                  <figcaption className="mt-8 border-t border-line pt-5">
                    <div className="font-display text-sm text-signal">{t.name}</div>
                    <div className="mt-1 text-[10px] tracking-[0.2em] text-ash uppercase">
                      {t.role}
                    </div>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============================== CTA ============================== */}
      <section className="relative overflow-hidden py-24 lg:py-36">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-25"
          style={{
            backgroundImage:
              'url(/media/backgrounds/bg-photo-1550355291-bbee04a92027.webp)',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/70 to-ink" />
        <div className="container-x relative text-center">
          <Reveal>
            <Eyebrow className="justify-center">¿Listo para tu próximo auto?</Eyebrow>
            <h2 className="mx-auto mt-6 max-w-[18ch] font-display text-[clamp(2rem,6vw,5rem)] leading-[0.9] text-smoke">
              Tu vehículo <span className="text-signal">listo para ti.</span>
            </h2>
            <p className="mx-auto mt-6 max-w-lg text-sm leading-relaxed text-ash">
              Cuéntanos qué buscas y nuestro equipo encuentra la unidad perfecta en el mercado de
              origen. Presupuesto sin compromiso en 48 horas.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Magnetic>
                <Button href="/contacto" cursor="Hablar">
                  Solicitar cotización
                </Button>
              </Magnetic>
              <Button href="/catalogo" variant="outline" cursor="Ver">
                Ver catálogo
              </Button>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
