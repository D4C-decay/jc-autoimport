'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Loader2, Lock, Mail, MailCheck, Phone, UserRound } from 'lucide-react';
import { api } from '@/lib/api';
import { Eyebrow } from './ui';
import { Reveal } from './motion';

export function RegisterPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [state, setState] = useState<'idle' | 'loading' | 'error' | 'sent'>('idle');
  const [error, setError] = useState('');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState('loading');
    setError('');
    try {
      await api.register({
        email,
        password,
        firstName,
        lastName,
        ...(phone ? { phone } : {}),
      });
      setState('sent');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear la cuenta.');
      setState('error');
    }
  }

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
            <Eyebrow index="Registro">Crea tu cuenta</Eyebrow>
            <h1 className="mt-5 font-display text-4xl leading-[0.95] text-smoke lg:text-5xl">
              Empieza tu <span className="text-signal">importación</span>
            </h1>
            <p className="mt-4 text-sm text-ash">
              Crea tu cuenta para dar seguimiento a tus unidades, reservas y documentos.
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
                Te enviamos un enlace de confirmación a <span className="text-smoke">{email}</span>.
                Ábrelo para verificar tu cuenta. Si no lo ves, revisa la carpeta de spam.
              </p>
              <p className="mt-4 text-[12px] text-ash">
                Puedes iniciar sesión sin confirmar, pero te pediremos que verifiques tu correo.
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
              <div className="grid gap-5 sm:grid-cols-2">
                <Field icon={<UserRound className="size-3.5" strokeWidth={1.7} />} label="Nombre">
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    autoComplete="given-name"
                    placeholder="Juan"
                    className={inputClass}
                  />
                </Field>
                <Field icon={<UserRound className="size-3.5" strokeWidth={1.7} />} label="Apellido">
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    autoComplete="family-name"
                    placeholder="Pérez"
                    className={inputClass}
                  />
                </Field>
              </div>

              <div className="mt-5">
                <Field icon={<Mail className="size-3.5" strokeWidth={1.7} />} label="Correo electrónico">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    placeholder="tucorreo@ejemplo.com"
                    className={inputClass}
                  />
                </Field>
              </div>

              <div className="mt-5">
                <Field icon={<Phone className="size-3.5" strokeWidth={1.7} />} label="Teléfono (opcional)">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    autoComplete="tel"
                    placeholder="+1 555 000 0000"
                    className={inputClass}
                  />
                </Field>
              </div>

              <div className="mt-5">
                <Field icon={<Lock className="size-3.5" strokeWidth={1.7} />} label="Contraseña">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    autoComplete="new-password"
                    placeholder="••••••••"
                    className={inputClass}
                  />
                </Field>
                <p className="mt-2 text-[11px] text-ash">
                  Mínimo 8 caracteres, con mayúscula, minúscula y un número.
                </p>
              </div>

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
                    <ArrowRight className="size-3.5" strokeWidth={1.8} />
                  )}
                  {state === 'loading' ? 'Creando cuenta…' : 'Crear cuenta'}
                </span>
              </button>

              <p className="mt-6 text-center text-[11px] text-ash">
                ¿Ya tienes cuenta?{' '}
                <a href="/login" className="text-signal hover:underline">
                  Inicia sesión
                </a>
              </p>
            </motion.form>
          )}
        </div>
      </div>
    </section>
  );
}

const inputClass =
  'w-full border border-line bg-ink py-3.5 pr-4 pl-11 text-sm text-smoke outline-none transition-colors placeholder:text-ash/50 focus:border-signal';

function Field({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-[10px] font-semibold tracking-[0.2em] text-signal uppercase">
        {label}
      </span>
      <div className="relative mt-2.5">
        <span className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-ash">
          {icon}
        </span>
        {children}
      </div>
    </label>
  );
}
