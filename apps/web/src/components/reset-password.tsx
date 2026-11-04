'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Check, Loader2, Lock } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { Session } from '@supabase/supabase-js';
import { Eyebrow } from './ui';
import { Reveal } from './motion';

export function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [state, setState] = useState<'checking' | 'idle' | 'loading' | 'done' | 'invalid'>('checking');
  const [error, setError] = useState('');

  // The recovery link lands on /auth/confirm, which exchanges the code for a
  // session and then redirects here. Without a session the link is invalid.
  useEffect(() => {
    let active = true;
    createClient()
      .auth.getSession()
      .then(({ data }: { data: { session: Session | null } }) => {
        if (!active) return;
        setState(data.session ? 'idle' : 'invalid');
        if (!data.session) {
          setError('El enlace es inválido o ha expirado. Solicita uno nuevo.');
        }
      })
      .catch(() => {
        if (active) {
          setState('invalid');
          setError('El enlace es inválido o ha expirado. Solicita uno nuevo.');
        }
      });
    return () => {
      active = false;
    };
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (password !== confirm) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setState('loading');
    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      setState('done');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo actualizar la contraseña.');
      setState('idle');
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
            <Eyebrow index="Acceso">Nueva contraseña</Eyebrow>
            <h1 className="mt-5 font-display text-4xl leading-[0.95] text-smoke lg:text-5xl">
              Establece tu <span className="text-signal">contraseña</span>
            </h1>
            <p className="mt-4 text-sm text-ash">
              Elige una contraseña nueva para tu cuenta. Mínimo 8 caracteres.
            </p>
          </Reveal>

          {state === 'done' ? (
            <motion.div
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="mt-10 border border-line bg-ink-2 p-7 md:p-8"
            >
              <div className="flex size-12 items-center justify-center border border-signal/40 bg-signal/10">
                <Check className="size-5 text-signal" strokeWidth={2} />
              </div>
              <h2 className="mt-6 font-display text-2xl text-smoke">Contraseña actualizada</h2>
              <p className="mt-3 text-sm text-ash">
                Ya puedes usar tu nueva contraseña. Tu sesión actual sigue activa.
              </p>
              <a
                href="/cuenta"
                className="btn-shine group relative mt-7 flex w-full items-center justify-center gap-2.5 overflow-hidden bg-signal px-8 py-4 text-[11px] font-semibold tracking-[0.24em] text-ink uppercase transition-all duration-300 active:scale-[0.98] hover:bg-signal-light [clip-path:polygon(0_0,100%_0,100%_72%,0_100%)]"
              >
                <span className="relative z-10 flex items-center gap-2.5">
                  <ArrowRight className="size-3.5" strokeWidth={1.8} />
                  Ir a mi cuenta
                </span>
              </a>
            </motion.div>
          ) : state === 'checking' ? (
            <div className="mt-10 flex items-center gap-3 border border-line bg-ink-2 p-7 text-sm text-ash">
              <Loader2 className="size-4 animate-spin" />
              Validando el enlace…
            </div>
          ) : (
            <motion.form
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              onSubmit={onSubmit}
              className="mt-10 border border-line bg-ink-2 p-7 md:p-8"
            >
              <PasswordField label="Nueva contraseña" value={password} onChange={setPassword} autoComplete="new-password" />
              <div className="mt-5">
                <PasswordField label="Repite la contraseña" value={confirm} onChange={setConfirm} autoComplete="new-password" />
              </div>

              {error ? (
                <p className="mt-5 border border-red-500/35 bg-red-500/8 px-4 py-2.5 text-[12px] text-red-300">
                  {error}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={state === 'loading' || state === 'invalid' || password.length < 8}
                className="btn-shine group relative mt-7 flex w-full items-center justify-center gap-2.5 overflow-hidden bg-signal px-8 py-4 text-[11px] font-semibold tracking-[0.24em] text-ink uppercase transition-all duration-300 active:scale-[0.98] hover:bg-signal-light disabled:opacity-60 [clip-path:polygon(0_0,100%_0,100%_72%,0_100%)]"
              >
                <span className="relative z-10 flex items-center gap-2.5">
                  {state === 'loading' ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Lock className="size-3.5" strokeWidth={1.8} />
                  )}
                  {state === 'loading' ? 'Guardando…' : 'Guardar contraseña'}
                </span>
              </button>

              {state === 'invalid' ? (
                <p className="mt-6 text-center text-[11px] text-ash">
                  <a href="/recuperar" className="text-signal hover:underline">
                    Solicitar un enlace nuevo
                  </a>
                </p>
              ) : null}
            </motion.form>
          )}
        </div>
      </div>
    </section>
  );
}

function PasswordField({
  label,
  value,
  onChange,
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: string;
}) {
  return (
    <label className="block">
      <span className="text-[10px] font-semibold tracking-[0.2em] text-signal uppercase">
        {label}
      </span>
      <div className="relative mt-2.5">
        <Lock
          className="pointer-events-none absolute top-1/2 left-4 size-3.5 -translate-y-1/2 text-ash"
          strokeWidth={1.7}
        />
        <input
          type="password"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required
          minLength={8}
          autoComplete={autoComplete}
          placeholder="••••••••"
          className="w-full border border-line bg-ink py-3.5 pr-4 pl-11 text-sm text-smoke outline-none transition-colors placeholder:text-ash/50 focus:border-signal"
        />
      </div>
    </label>
  );
}
