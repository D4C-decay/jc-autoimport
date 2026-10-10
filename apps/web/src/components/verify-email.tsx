'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Loader2, MailCheck, MailX } from 'lucide-react';
import { api } from '@/lib/api';
import { Eyebrow } from './ui';
import { Reveal } from './motion';

export function VerifyEmail({ token }: { token: string }) {
  const [state, setState] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      setError('El enlace no incluye un token de verificación.');
      setState('error');
      return;
    }

    let active = true;
    api
      .verifyEmail(token)
      .then(() => {
        if (active) setState('success');
      })
      .catch((err: unknown) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'El enlace es inválido o ha expirado.');
        setState('error');
      });

    return () => {
      active = false;
    };
  }, [token]);

  return (
    <section className="relative flex min-h-[100svh] items-center overflow-hidden pt-18">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{
          backgroundImage: 'url(/media/backgrounds/bg-photo-1502877338535-766e1452684a.webp)',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-ink/85 via-ink/92 to-ink" />

      <div className="container-x relative w-full">
        <div className="mx-auto max-w-md">
          <Reveal>
            <Eyebrow index="Verificación">Confirmación de correo</Eyebrow>
            <h1 className="mt-5 font-display text-4xl leading-[0.95] text-smoke lg:text-5xl">
              Verificando tu <span className="text-signal">correo</span>
            </h1>
          </Reveal>

          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="mt-10 border border-line bg-ink-2 p-7 md:p-8"
          >
            {state === 'loading' ? (
              <div className="flex items-center gap-3 text-sm text-ash">
                <Loader2 className="size-4 animate-spin text-signal" />
                Confirmando tu correo…
              </div>
            ) : state === 'success' ? (
              <>
                <div className="flex size-12 items-center justify-center border border-signal/40 bg-signal/10">
                  <MailCheck className="size-5 text-signal" strokeWidth={1.7} />
                </div>
                <h2 className="mt-6 font-display text-2xl text-smoke">Correo confirmado</h2>
                <p className="mt-3 text-sm text-ash">
                  Tu cuenta quedó verificada. Ya puedes iniciar sesión y continuar con tu
                  importación.
                </p>
                <a
                  href="/login"
                  className="btn-shine group relative mt-7 flex w-full items-center justify-center gap-2.5 overflow-hidden bg-signal px-8 py-4 text-[11px] font-semibold tracking-[0.24em] text-ink uppercase transition-all duration-300 active:scale-[0.98] hover:bg-signal-light [clip-path:polygon(0_0,100%_0,100%_72%,0_100%)]"
                >
                  <span className="relative z-10 flex items-center gap-2.5">
                    <ArrowRight className="size-3.5" strokeWidth={1.8} />
                    Iniciar sesión
                  </span>
                </a>
              </>
            ) : (
              <>
                <div className="flex size-12 items-center justify-center border border-red-500/40 bg-red-500/10">
                  <MailX className="size-5 text-red-300" strokeWidth={1.7} />
                </div>
                <h2 className="mt-6 font-display text-2xl text-smoke">No se pudo verificar</h2>
                <p className="mt-3 text-sm text-ash">{error}</p>
                <p className="mt-4 text-[12px] text-ash">
                  Inicia sesión y pide un nuevo enlace desde tu área de cliente.
                </p>
                <a
                  href="/login"
                  className="btn-shine group relative mt-7 flex w-full items-center justify-center gap-2.5 overflow-hidden bg-signal px-8 py-4 text-[11px] font-semibold tracking-[0.24em] text-ink uppercase transition-all duration-300 active:scale-[0.98] hover:bg-signal-light [clip-path:polygon(0_0,100%_0,100%_72%,0_100%)]"
                >
                  <span className="relative z-10 flex items-center gap-2.5">
                    <ArrowRight className="size-3.5" strokeWidth={1.8} />
                    Ir a iniciar sesión
                  </span>
                </a>
              </>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
