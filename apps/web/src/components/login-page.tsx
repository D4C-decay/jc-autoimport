'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight, Loader2, Lock, Mail, ShieldCheck } from 'lucide-react';
import { api } from '@/lib/api';
import { Eyebrow } from './ui';
import { Reveal } from './motion';

export function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [tempToken, setTempToken] = useState('');
  const [step, setStep] = useState<'credentials' | '2fa'>('credentials');
  const [state, setState] = useState<'idle' | 'loading' | 'error'>('idle');
  const [error, setError] = useState('');

  // El backend deja la sesión en cookies httpOnly; aqui no se guarda nada.
  function goHome() {
    router.push('/cuenta');
    router.refresh();
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState('loading');
    setError('');
    try {
      const res = await api.login({ email, password });
      if (res.requires2FA && res.tempToken) {
        setTempToken(res.tempToken);
        setStep('2fa');
        setState('idle');
        return;
      }
      goHome();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Credenciales inválidas.');
      setState('error');
    }
  }

  async function onSubmit2fa(e: React.FormEvent) {
    e.preventDefault();
    setState('loading');
    setError('');
    try {
      await api.verify2fa({ tempToken, code });
      goHome();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Código incorrecto.');
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
            <Eyebrow index="Acceso">Área de cliente</Eyebrow>
            <h1 className="mt-5 font-display text-4xl leading-[0.95] text-smoke lg:text-5xl">
              {step === '2fa' ? (
                <>
                  Verifica tu <span className="text-signal">identidad</span>
                </>
              ) : (
                <>
                  Bienvenido de <span className="text-signal">vuelta</span>
                </>
              )}
            </h1>
            <p className="mt-4 text-sm text-ash">
              {step === '2fa'
                ? 'Introduce el código de 6 dígitos de tu aplicación de autenticación.'
                : 'Inicia sesión para dar seguimiento a tu importación y ver tus unidades reservadas.'}
            </p>
          </Reveal>

          {step === 'credentials' ? (
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

              <label className="mt-5 block">
                <span className="text-[10px] font-semibold tracking-[0.2em] text-signal uppercase">
                  Contraseña
                </span>
                <div className="relative mt-2.5">
                  <Lock
                    className="pointer-events-none absolute top-1/2 left-4 size-3.5 -translate-y-1/2 text-ash"
                    strokeWidth={1.7}
                  />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className="w-full border border-line bg-ink py-3.5 pr-4 pl-11 text-sm text-smoke outline-none transition-colors placeholder:text-ash/50 focus:border-signal"
                  />
                </div>
              </label>

              {state === 'error' ? <ErrorNote error={error} /> : null}

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
                  {state === 'loading' ? 'Entrando…' : 'Entrar'}
                </span>
              </button>

              <p className="mt-6 text-center text-[11px] text-ash">
                ¿Aún no tienes cuenta?{' '}
                <a href="/contacto" className="text-signal hover:underline">
                  Solicita acceso
                </a>
              </p>
            </motion.form>
          ) : (
            <motion.form
              key="2fa"
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              onSubmit={onSubmit2fa}
              className="mt-10 border border-line bg-ink-2 p-7 md:p-8"
            >
              <label className="block">
                <span className="text-[10px] font-semibold tracking-[0.2em] text-signal uppercase">
                  Código de verificación
                </span>
                <div className="relative mt-2.5">
                  <ShieldCheck
                    className="pointer-events-none absolute top-1/2 left-4 size-3.5 -translate-y-1/2 text-ash"
                    strokeWidth={1.7}
                  />
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    required
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder="000000"
                    className="w-full border border-line bg-ink py-3.5 pr-4 pl-11 text-center font-mono text-lg tracking-[0.4em] text-smoke outline-none transition-colors placeholder:text-ash/40 focus:border-signal"
                  />
                </div>
              </label>

              {state === 'error' ? <ErrorNote error={error} /> : null}

              <button
                type="submit"
                disabled={state === 'loading' || code.length < 6}
                className="btn-shine group relative mt-7 flex w-full items-center justify-center gap-2.5 overflow-hidden bg-signal px-8 py-4 text-[11px] font-semibold tracking-[0.24em] text-ink uppercase transition-all duration-300 active:scale-[0.98] hover:bg-signal-light disabled:opacity-60 [clip-path:polygon(0_0,100%_0,100%_72%,0_100%)]"
              >
                <span className="relative z-10 flex items-center gap-2.5">
                  {state === 'loading' ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <ShieldCheck className="size-3.5" strokeWidth={1.8} />
                  )}
                  {state === 'loading' ? 'Verificando…' : 'Verificar'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep('credentials');
                  setCode('');
                  setState('idle');
                  setError('');
                }}
                className="mt-4 w-full text-center text-[11px] text-ash hover:text-smoke"
              >
                Volver al inicio de sesión
              </button>
            </motion.form>
          )}
        </div>
      </div>
    </section>
  );
}

function ErrorNote({ error }: { error: string }) {
  return (
    <p className="mt-5 border border-red-500/35 bg-red-500/8 px-4 py-2.5 text-[12px] text-red-300">
      {error}
    </p>
  );
}
