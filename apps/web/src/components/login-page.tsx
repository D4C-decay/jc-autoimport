'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight, Loader2, Lock, Mail } from 'lucide-react';
import { api } from '@/lib/api';
import { Eyebrow } from './ui';
import { Reveal } from './motion';

export function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [state, setState] = useState<'idle' | 'loading' | 'error'>('idle');
  const [error, setError] = useState('');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState('loading');
    setError('');
    try {
      const res = await api.login({ email, password });
      localStorage.setItem('jca_token', res.tokens.accessToken);
      localStorage.setItem('jca_refresh', res.tokens.refreshToken);
      localStorage.setItem('jca_user', JSON.stringify(res.user));
      router.push('/catalogo');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Credenciales inválidas.');
      setState('error');
    }
  }

  return (
    <section className="relative flex min-h-[100svh] items-center overflow-hidden pt-18">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{
          backgroundImage:
            'url(https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=2400&q=80)',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-ink/85 via-ink/92 to-ink" />

      <div className="container-x relative w-full">
        <div className="mx-auto max-w-md">
          <Reveal>
            <Eyebrow index="Acceso">Área de cliente</Eyebrow>
            <h1 className="mt-5 font-display text-4xl leading-[0.95] text-smoke lg:text-5xl">
              Bienvenido de <span className="text-signal">vuelta</span>
            </h1>
            <p className="mt-4 text-sm text-ash">
              Inicia sesión para dar seguimiento a tu importación y ver tus unidades reservadas.
            </p>
          </Reveal>

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

            {state === 'error' ? (
              <p className="mt-5 border border-red-500/35 bg-red-500/8 px-4 py-2.5 text-[12px] text-red-300">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={state === 'loading'}
              className="btn-shine group relative mt-7 flex w-full items-center justify-center gap-2.5 overflow-hidden bg-signal px-8 py-4 text-[11px] font-semibold tracking-[0.24em] text-ink uppercase transition-colors duration-500 hover:bg-signal-light disabled:opacity-60 [clip-path:polygon(0_0,100%_0,100%_72%,0_100%)]"
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
        </div>
      </div>
    </section>
  );
}
