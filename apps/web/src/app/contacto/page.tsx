import type { Metadata } from 'next';
import { LeadForm } from '@/components/lead-form';
import { Reveal } from '@/components/motion';
import { Eyebrow } from '@/components/ui';
import { CONTACT_ADDRESS, CONTACT_EMAIL, CONTACT_PHONE, CONTACT_WHATSAPP } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Contacto',
  description:
    'Habla con un asesor de JC Autoimport. Cotizaciones gratuitas, seguimiento de tu importación y respuesta en menos de 24 horas.',
};

export default function Page() {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 lg:pt-40 lg:pb-28">
      <div
        className="absolute inset-0 opacity-12"
        style={{
          backgroundImage:
            'url(https://images.unsplash.com/photo-1502161254066-6c74afbf07aa?auto=format&fit=crop&w=2000&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-ink/80 via-ink/90 to-ink" />

      <div className="container-x relative grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
        <div>
          <Eyebrow index="01">Hablemos</Eyebrow>
          <h1 className="mt-5 font-display text-[clamp(2.2rem,6vw,5rem)] leading-[0.9] text-smoke">
            Cuéntanos qué <span className="text-signal">buscas.</span>
          </h1>
          <p className="mt-6 max-w-md text-sm leading-relaxed text-ash">
            Completa el formulario o escríbenos directamente. Un asesor te contacta en menos de 24
            horas con un presupuesto detallado y sin compromiso.
          </p>

          <div className="mt-12 space-y-px bg-line">
            {[
              { label: 'Teléfono', value: CONTACT_PHONE, href: `tel:${CONTACT_PHONE.replace(/[^\d+]/g, '')}` },
              { label: 'WhatsApp', value: 'Responde en minutos', href: CONTACT_WHATSAPP },
              { label: 'Correo', value: CONTACT_EMAIL, href: `mailto:${CONTACT_EMAIL}` },
              { label: 'Oficina', value: CONTACT_ADDRESS, href: undefined },
            ].map((c) => (
              <div key={c.label} className="bg-ink-2 p-5">
                <div className="text-[10px] font-semibold tracking-[0.24em] text-signal uppercase">
                  {c.label}
                </div>
                {c.href ? (
                  <a
                    href={c.href}
                    target={c.href.startsWith('http') ? '_blank' : undefined}
                    rel="noreferrer"
                    className="mt-1.5 block text-sm text-smoke transition-colors hover:text-signal"
                  >
                    {c.value}
                  </a>
                ) : (
                  <p className="mt-1.5 text-sm leading-relaxed text-smoke">{c.value}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        <Reveal>
          <div className="border border-line bg-ink-2 p-7 md:p-10">
            <h2 className="font-display text-xl text-smoke md:text-2xl">Solicita tu cotización</h2>
            <p className="mt-2 mb-7 text-[13px] text-ash">
              Sin compromiso. Datos protegidos.
            </p>
            <LeadForm cta="Enviar solicitud" />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
