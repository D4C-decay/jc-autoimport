'use client';

import { useId, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight, Loader2, Lock, Mail, ShieldCheck } from 'lucide-react';
import type { Factor } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { authMessage } from '@/lib/supabase/errors';
import { AuthErrorNote } from './auth-error';
import { Eyebrow } from './ui';
import { Reveal } from './motion';

function safeNext(value: string | undefined): string {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return '/cuenta';
  return value;
}

export function LoginPage({
  next = '/cuenta',
  initialError = '',
}: {
  next?: string;
  initialError?: string;
}) {
  const router = useRouter();
  const errorId = useId();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [factorId, setFactorId] = useState('');
  const [step, setStep] = useState<'credentials' | '2fa'>('credentials');
  const [state, setState] = useState<'idle' | 'loading' | 'error'>(initialError ? 'error' : 'idle');
  const [error, setError] = useState(initialError);
  const [unconfirmed, setUnconfirmed] = useState(false);

  // La sesión vive en cookies gestionadas por Supabase; aquí no se guarda nada.
  function goNext() {
    router.push(safeNext(next));
    router.refresh();
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState('loading');
    setError('');
    setUnconfirmed(false);
    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) throw signInError;

      // Si la cuenta tiene TOTP verificado, la sesión queda en aal1 hasta que
      // se introduce el código: se exige el segundo factor antes de continuar.
      const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (aal?.nextLevel === 'aal2' && aal.currentLevel !== 'aal2') {
        const { data: factors, error: factorsError } = await supabase.auth.mfa.listFactors();
        if (factorsError) throw factorsError;
        const totp = factors.totp.find((factor: Factor) => factor.status === 'verified');
        if (totp) {
          setFactorId(totp.id);
          setStep('2fa');
          setState('idle');
          return;
        }
      }

      goNext();
    } catch (err) {
      const message = authMessage(err, 'No se pudo iniciar sesión.');
      setError(message);
      setUnconfirmed(message.includes('no está confirmado'));
      setState('error');
    }
  }

  async function onSubmit2fa(e: React.FormEvent) {
    e.preventDefault();
    setState('loading');
    setError('');
    try {
      if (!factorId) throw new Error('No se encontró tu autenticador.');
      const supabase = createClient();
      const { error: verifyError } = await supabase.auth.mfa.challengeAndVerify({
        factorId,
        code,
      });
      if (verifyError) throw verifyError;
      goNext();
    } catch (err) {
      setError(authMessage(err, 'Código incorrecto.'));
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
                  Verifica tu <span className="text-signal-text">identidad</span>
                </>
              ) : (
                <>
                  Bienvenido de <span className="text-signal-text">vuelta</span>
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
                <span className="text-[10px] font-semibold tracking-[0.2em] text-signal-text uppercase">
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
                    aria-invalid={state === 'error'}
                    aria-describedby={state === 'error' ? errorId : undefined}
                    className="w-full border border-line bg-ink py-3.5 pr-4 pl-11 text-sm text-smoke outline-none transition-colors placeholder:text-ash/50 focus:border-signal"
                  />
                </div>
              </label>

              <label className="mt-5 block">
                <span className="text-[10px] font-semibold tracking-[0.2em] text-signal-text uppercase">
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
                    aria-invalid={state === 'error'}
                    aria-describedby={state === 'error' ? errorId : undefined}
                    className="w-full border border-line bg-ink py-3.5 pr-4 pl-11 text-sm text-smoke outline-none transition-colors placeholder:text-ash/50 focus:border-signal"
                  />
                </div>
              </label>

              {state === 'error' ? (
                <AuthErrorNote id={errorId}>
                  <p>{error}</p>
                  {unconfirmed ? (
                    <a
                      href={`/verificar?email=${encodeURIComponent(email)}`}
                      className="mt-1 inline-block py-2 text-signal-text hover:underline"
                    >
                      Reenviar correo de confirmación
                    </a>
                  ) : null}
                </AuthErrorNote>
              ) : null}

              <button
                type="submit"
                disabled={state === 'loading'}
                className="btn-shine group relative mt-7 flex w-full items-center justify-center gap-2.5 overflow-hidden bg-signal px-8 py-4 text-[11px] font-semibold tracking-[0.24em] text-white uppercase transition-all duration-300 active:scale-[0.98] hover:bg-signal-dark disabled:opacity-60 [clip-path:polygon(0_0,100%_0,100%_72%,0_100%)]"
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

              <div className="mt-5 flex items-center justify-between text-[11px] text-ash">
                <a
                  href="/recuperar"
                  className="inline-flex min-h-11 items-center text-signal-text hover:underline"
                >
                  ¿Olvidaste tu contraseña?
                </a>
                <a href="/verificar" className="inline-flex min-h-11 items-center hover:text-smoke">
                  Confirmar correo
                </a>
              </div>

              <p className="mt-4 text-center text-[11px] text-ash">
                ¿Aún no tienes cuenta?{' '}
                <a
                  href="/registro"
                  className="inline-block py-2 text-signal-text hover:underline"
                >
                  Crear una cuenta
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
                <span className="text-[10px] font-semibold tracking-[0.2em] text-signal-text uppercase">
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
                    aria-invalid={state === 'error'}
                    aria-describedby={state === 'error' ? errorId : undefined}
                    className="w-full border border-line bg-ink py-3.5 pr-4 pl-11 text-center font-mono text-lg tracking-[0.4em] text-smoke outline-none transition-colors placeholder:text-ash/40 focus:border-signal"
                  />
                </div>
              </label>

              {state === 'error' ? <AuthErrorNote id={errorId}>{error}</AuthErrorNote> : null}

              <button
                type="submit"
                disabled={state === 'loading' || code.length < 6}
                className="btn-shine group relative mt-7 flex w-full items-center justify-center gap-2.5 overflow-hidden bg-signal px-8 py-4 text-[11px] font-semibold tracking-[0.24em] text-white uppercase transition-all duration-300 active:scale-[0.98] hover:bg-signal-dark disabled:opacity-60 [clip-path:polygon(0_0,100%_0,100%_72%,0_100%)]"
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
                className="mt-4 inline-flex min-h-11 w-full items-center justify-center text-center text-[11px] text-ash hover:text-smoke"
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
