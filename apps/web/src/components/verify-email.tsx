'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Loader2, Mail, MailCheck } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { authRedirect } from '@/lib/supabase/config';
import { Eyebrow } from './ui';
import { Reveal } from './motion';

export function VerifyEmail({ email: initialEmail = '' }: { email?: string }) {
  const [email, setEmail] = useState(initialEmail);
  const [state, setState] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle');
  const [error, setError] = useState('');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState('loading');
    setError('');
    try {
      const supabase = createClient();
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: { emailRedirectTo: authRedirect('/cuenta') },
      });
      if (resendError) throw resendError;
      setState('sent');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo reenviar el correo.');
      setState('error');
    }
  }

  return (
    <section className="relative flex min-h-[100svh] items-center overflow-hidden pt-18">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{
          backgroundImage:
            'url(/media/backgrounds/bg-photo-1502877338535-766e1452684a.webp)',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-ink/85 via-ink/92 to-ink" />

      <div className="container-x relative w-full">
        <div className="mx-auto max-w-md">
          <Reveal>
            <Eyebrow index="Cuenta">Confirmar correo</Eyebrow>
            <h1 className="mt-5 font-display text-4xl leading-[0.95] text-smoke lg:text-5xl">
              Verifica tu <span className="text-signal">correo</span>
            </h1>
            <p className="mt-4 text-sm text-ash">
              Si tu cuenta aún no está confirmada, te enviamos un enlace nuevo.
            </p>
          </Reveal>

          {state === 'sent' ? (
            <motion.div
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="mt-10 border border-line bg-ink-2 p-7 md:p-8"
            >
              <div className="flex size-12 items-center justify-center border border-signal/40 bg-signal/10">
                <MailCheck className="size-5 text-signal" strokeWidth={1.7} />
              </div>
              <h2 className="mt-6 font-display text-2xl text-smoke">Revisa tu correo</h2>
              <p className="mt-3 text-sm text-ash">
                Enviamos el enlace de confirmación a <span className="text-smoke">{email}</span>.
                Ábrelo para verificar tu cuenta. Si no lo ves, revisa la carpeta de spam.
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
            </motion.div>
          ) : (
            <motion.form
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              onSubmit={onSubmit}
              className="mt-10 border border-line bg-ink-2 p-7 md:p-8"
            >
              <label className="block">
                <span className="text-[10px] font-semibold tracking-[0.2em] text-signal uppercase">
                  Correo electrónico
                </span>
                <div className="relative mt-2.5">
                  <Mail
                    className="pointer-events-none absolute top-1/2 left-4 size-3.5 -translate-y-1/2 text-ash"
                    strokeWidth={1.7}
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    placeholder="tucorreo@ejemplo.com"
                    className="w-full border border-line bg-ink py-3.5 pr-4 pl-11 text-sm text-smoke outline-none transition-colors placeholder:text-ash/50 focus:border-signal"
                  />
                </div>
              </label>

              {state === 'error' ? (
                <p className="mt-5 border border-red-500/35 bg-red-500/8 px-4 py-2.5 text-[12px] text-red-300">
                  {error}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={state === 'loading'}
                className="btn-shine group relative mt-7 flex w-full items-center justify-center gap-2.5 overflow-hidden bg-signal px-8 py-4 text-[11px] font-semibold tracking-[0.24em] text-ink uppercase transition-all duration-300 active:scale-[0.98] hover:bg-signal-light disabled:opacity-60 [clip-path:polygon(0_0,100%_0,100%_72%,0_100%)]"
              >
                <span className="relative z-10 flex items-center gap-2.5">
                  {state === 'loading' ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <MailCheck className="size-3.5" strokeWidth={1.8} />
                  )}
                  {state === 'loading' ? 'Enviando…' : 'Reenviar confirmación'}
                </span>
              </button>

              <p className="mt-6 text-center text-[11px] text-ash">
                <a href="/login" className="text-signal hover:underline">
                  Volver al inicio de sesión
                </a>
              </p>
            </motion.form>
          )}
        </div>
      </div>
    </section>
  );
}
