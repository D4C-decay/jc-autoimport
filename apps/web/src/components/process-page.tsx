'use client';

import { Link } from '@/i18n/navigation';
import { motion } from 'framer-motion';
import { ArrowRight, Check } from 'lucide-react';
import { Button, Eyebrow } from './ui';
import { Counter, Reveal, SectionLabel } from './motion';
import { CONTACT_WHATSAPP } from '@/lib/site';
import InfiniteMenu from '@/components/react-bits/InfiniteMenu';
import { useMemo, useState } from 'react';

const STEPS = [
  {
    n: '01',
    title: 'Selección',
    lead: 'Tú defines el objetivo, nosotros la unidad.',
    body: 'Envíanos tu ficha técnica (marca, modelo, año, kilometraje, presupuesto) o explora nuestro catálogo verificado. Si la unidad no está en stock, la buscamos en el mercado de origen con acceso a subastas y concesionarios.',
    points: [
      'Catálogo actualizado con precios reales',
      'Búsqueda por encargo en 5 países',
      'Presupuesto detallado en 48 h',
    ],
    image:
      '/media/backgrounds/bg-photo-1552519507-da3b142c6e3d.webp',
  },
  {
    n: '02',
    title: 'Inspección en origen',
    lead: '120 puntos antes de pagar un centavo.',
    body: 'Nuestro equipo se desplaza al concesionario o venta. Verificamos VIN, historial de accidentes, espesor de pintura con medidor, kilometraje real contra odómetro, fechas de componentes y prueba de ruta. Si algo no cumple, la unidad queda descartada.',
    points: [
      'Informe fotográfico y en video',
      'Medidor de espesor de pintura',
      'Verificación de VIN e historial de accidentes',
    ],
    image:
      '/media/backgrounds/bg-photo-1489824904134-891ab64532f1.webp',
  },
  {
    n: '03',
    title: 'Compra y embarque',
    lead: 'Pago seguro, contenedor con seguro.',
    body: 'Transacción mediante casa de cambio con carta de intención. Pagamos al vendedor, el vehículo entra a contenedor y se embarca con seguro de carga a nombre del cliente. Recibes tracking en tiempo real desde el puerto de salida.',
    points: [
      'Carta de intención de compra',
      'Seguro de carga total',
      'Rastreo puerta a puerta',
    ],
    image:
      '/media/backgrounds/bg-photo-1494412519320-aa613dfb7738.webp',
  },
  {
    n: '04',
    title: 'Aduanas, taller y matrícula',
    lead: 'Trámites sin procesos paralelos.',
    body: 'Despacho aduanal, cálculo y pago de aranceles, importación ante el organismo oficial, revisión técnica, corrección de cualquier detalle de transferencia y tramitación de placas.',
    points: [
      'Despacho aduanal gestionado',
      'Revisión técnica aprobada',
      'Placas y matrícula entregadas',
    ],
    image:
      '/media/backgrounds/bg-photo-1486006920555-c77dcf18193c.webp',
  },
  {
    n: '05',
    title: 'Entrega llave en mano',
    lead: 'Lo pruebas. Si te gusta, ya es tuyo.',
    body: 'Entregamos en tu domicilio o en nuestras instalaciones. Transferencia, placas, documentación completa y una prueba de manejo final. Activamos tu garantía mecánica de 90 días o 5,000 km desde la entrega.',
    points: [
      'Entrega a domicilio',
      'Prueba de manejo final',
      '90 días de garantía mecánica',
    ],
    image:
      '/media/backgrounds/bg-photo-1550355291-bbee04a92027.webp',
  },
];

const ORIGINS = [
  { country: 'Estados Unidos', code: 'US', note: 'EE.UU. · subastas y concesionarios' },
  { country: 'Japón', code: 'JP', note: 'Japón · subastas y dealers' },
  { country: 'Corea del Sur', code: 'KR', note: 'Corea del Sur · importadores directos' },
  { country: 'Europa', code: 'EU', note: 'Europa · red de alta gama' },
  { country: 'Dubái', code: 'AE', note: 'Dubái · importadores directos' },
];

const FAQ = [
  {
    q: '¿Cuánto tarda el proceso completo?',
    a: 'Entre 45 y 75 días calendario desde la compra hasta la entrega: 5 a 10 días de búsqueda e inspección, 25 a 35 días de embarque, y 15 a 30 días de aduana y trámites.',
  },
  {
    q: '¿El precio del catálogo es el final?',
    a: 'Sí. El precio mostrado es de venta final en destino e incluye importación, nacionalización, taller, revisión técnica y matrícula. Los impuestos están calculados dentro del total.',
  },
  {
    q: '¿Puedo inspeccionar el vehículo antes de comprar?',
    a: 'Es lo primero que hacemos. Nunca compramos sin inspección física previa. Recibes el informe fotográfico y en video antes deAuthorize cualquier desembolso.',
  },
  {
    q: '¿Qué garantía ofrecen?',
    a: '90 días o 5,000 km de garantía mecánica sobre motor y transmisión, contados desde la entrega. Además, gestionamos cualquier reclamo de garantía del fabricante con el concesionario en origen.',
  },
];

export function ProcessPage() {
  const [stage, setStage] = useState(0);
  const menuItems = useMemo(
    () =>
      STEPS.map((s) => ({
        image: s.image,
        title: `${s.n} · ${s.title}`,
        description: s.lead,
      })),
    []
  );
  return (
    <>
      {/* ============================== HERO ============================== */}
      <section className="relative flex min-h-[72svh] items-end overflow-hidden pt-18">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              'url(/media/backgrounds/bg-photo-1502161254066-6c74afbf07aa.webp)',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/85 via-ink/50 to-ink" />
        <div className="container-x relative w-full py-16 lg:py-24">
          <Eyebrow index="Proceso">Cómo trabajamos</Eyebrow>
          <h1 className="mt-6 max-w-[18ch] font-display text-[clamp(2.4rem,7.5vw,7rem)] leading-[0.88] text-smoke">
            Del catálogo
            <br />
            a <span className="text-signal">tu garaje</span> en 5 pasos
          </h1>
          <p className="mt-7 max-w-xl text-sm leading-relaxed text-ash md:text-base">
            Convertimos una compra internacional compleja en una ruta clara. Un solo equipo coordina
            toda la operación y te reporta en cada etapa.
          </p>
        </div>
      </section>

      {/* ============================== ORIGINS ============================== */}
      <section className="border-y border-line bg-ink-2 py-10">
        <div className="container-x">
          <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
            <span className="text-[10px] tracking-[0.24em] text-ash uppercase">Orígenes</span>
            {ORIGINS.map((o) => (
              <div key={o.code} className="group flex items-center gap-3">
                <span className="flex size-9 items-center justify-center border border-line text-[9px] font-semibold tracking-widest text-ash transition-colors duration-500 group-hover:border-signal group-hover:text-signal">
                  {o.code}
                </span>
                <span className="text-xs text-ash transition-colors group-hover:text-smoke">
                  {o.country}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================== STEPS ============================== */}
      <section className="py-20 lg:py-28">
        <div className="container-x space-y-24 lg:space-y-32">
          {STEPS.map((s, i) => {
            const flip = i % 2 === 1;
            return (
              <div
                key={s.n}
                className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16"
              >
                <Reveal className={flip ? 'lg:order-2' : undefined}>
                  <div className="relative aspect-4/3 overflow-hidden bg-ink-3">
                    <span className="absolute top-5 left-5 font-display text-5xl text-signal/25 z-10">
                      {s.n}
                    </span>
                  </div>
                </Reveal>

                <Reveal delay={0.12} className={flip ? 'lg:order-1' : undefined}>
                  <div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs tracking-[0.3em] text-signal">{s.n}</span>
                      <span className="h-px flex-1 bg-signal/30" />
                    </div>
                    <h2 className="mt-5 font-display text-[clamp(1.6rem,3.5vw,2.8rem)] leading-[0.95] text-smoke">
                      {s.title}
                    </h2>
                    <p className="mt-3 text-sm text-signal">{s.lead}</p>
                    <p className="mt-5 max-w-lg text-sm leading-relaxed text-ash">{s.body}</p>
                    <ul className="mt-7 space-y-3">
                      {s.points.map((p) => (
                        <li key={p} className="flex items-start gap-3 text-sm text-smoke/85">
                          <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center border border-signal text-signal">
                            <Check className="size-2.5" strokeWidth={3} />
                          </span>
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                </Reveal>
              </div>
            );
          })}
        </div>
      </section>

      {/* ============================== STATS BAND ============================== */}
      <section className="relative overflow-hidden border-y border-line bg-ink-2 py-16">
        <div className="container-x grid grid-cols-2 gap-8 lg:grid-cols-4">
          {[
            { v: 45, suf: ' días', l: 'Tiempo promedio' },
            { v: 120, suf: ' pts', l: 'Puntos de inspección' },
            { v: 98, suf: '%', l: 'Unidades aprobadas' },
            { v: 90, suf: ' días', l: 'Garantía mecánica' },
          ].map((s, i) => (
            <Reveal key={s.l} delay={i * 0.08}>
              <div className="text-center lg:text-left">
                <div className="font-display text-3xl text-smoke lg:text-4xl">
                  <Counter to={s.v} suffix={s.suf} />
                </div>
                <p className="mt-2 text-[10px] tracking-[0.2em] text-ash uppercase">{s.l}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ============================== FAQ ============================== */}
      <section className="py-20 lg:py-28">
        <div className="container-x">
          <SectionLabel index="FAQ">Preguntas frecuentes</SectionLabel>
          <div className="mt-10 grid gap-px bg-line lg:grid-cols-2">
            {FAQ.map((f, i) => (
              <Reveal key={f.q} delay={i * 0.06}>
                <div className="h-full bg-ink p-7">
                  <h3 className="font-display text-base text-smoke">{f.q}</h3>
                  <p className="mt-3 text-[13px] leading-relaxed text-ash">{f.a}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============================== CTA ============================== */}
      <section className="border-t border-line py-20 lg:py-28">
        <div className="container-x text-center">
          <motion.div
            initial={{ opacity: 0, y: 26 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <h2 className="mx-auto max-w-[20ch] font-display text-[clamp(1.8rem,5vw,3.6rem)] leading-[0.92] text-smoke">
              Empecemos por tu <span className="text-signal">próxima unidad</span>
            </h2>
            <p className="mx-auto mt-5 max-w-md text-sm text-ash">
              Escríbenos por WhatsApp o completa el formulario. Te respondemos el mismo día.
            </p>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button href="/contacto">Solicitar cotización</Button>
              <Button href={CONTACT_WHATSAPP} variant="outline">
                Escribir por WhatsApp
              </Button>
            </div>
            <Link
              href="/catalogo"
              className="group mt-8 inline-flex items-center gap-2 text-[11px] tracking-[0.22em] text-ash uppercase transition-colors hover:text-signal"
            >
              Ver catálogo completo
              <ArrowRight
                className="size-3.5 transition-transform duration-500 group-hover:translate-x-1.5"
                strokeWidth={1.7}
              />
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  );
}
