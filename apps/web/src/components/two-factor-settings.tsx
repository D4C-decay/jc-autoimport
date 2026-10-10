'use client';

import { useEffect, useState } from 'react';
import { Check, KeyRound, Loader2, Lock, ShieldCheck } from 'lucide-react';
import { api } from '@/lib/api';

export function TwoFactorSettings() {
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [state, setState] = useState<'idle' | 'loading' | 'error'>('idle');
  const [error, setError] = useState('');
  const [setup, setSetup] = useState<{ secret: string; qrDataUrl: string } | null>(null);
  const [code, setCode] = useState('');

  useEffect(() => {
    api
      .twoFactorStatus()
      .then((s) => setEnabled(s.enabled))
      .catch(() => setEnabled(false));
  }, []);

  async function startSetup() {
    setState('loading');
    setError('');
    try {
      const { secret, qrDataUrl } = await api.twoFactorSetup();
      setSetup({ secret, qrDataUrl });
      setState('idle');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo iniciar la configuración.');
      setState('error');
    }
  }

  async function confirmSetup() {
    if (code.length < 6) return;
    setState('loading');
    setError('');
    try {
      await api.twoFactorEnable(code);
      setEnabled(true);
      setSetup(null);
      setCode('');
      setState('idle');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Código inválido.');
      setState('error');
    }
  }

  async function confirmDisable() {
    if (code.length < 6) return;
    setState('loading');
    setError('');
    try {
      await api.twoFactorDisable(code);
      setEnabled(false);
      setCode('');
      setState('idle');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Código inválido.');
      setState('error');
    }
  }

  return (
    <div className="border border-line bg-ink-2 p-7 md:p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2.5 font-display text-sm tracking-[0.16em] text-smoke uppercase">
            <ShieldCheck className="size-4 text-signal" strokeWidth={1.7} />
            Verificación en dos pasos
          </h2>
          <p className="mt-3 text-xs leading-relaxed text-ash">
            Protege tu cuenta con un código de 6 dígitos generado por tu
            aplicación de autenticación (Google Authenticator, Authy,…).
          </p>
        </div>
        {enabled === true ? (
          <span className="flex shrink-0 items-center gap-1.5 border border-signal/40 px-3 py-1.5 text-[9px] font-semibold tracking-[0.2em] text-signal uppercase">
            <Check className="size-3" strokeWidth={2.4} />
            Activo
          </span>
        ) : null}
      </div>

      {enabled === null ? <Skeleton /> : null}

      {enabled === false && setup === null ? (
        <button
          type="button"
          onClick={startSetup}
          disabled={state === 'loading'}
          className="btn-shine group relative mt-7 inline-flex items-center gap-2.5 overflow-hidden bg-signal px-6 py-3.5 text-[10px] font-semibold tracking-[0.22em] text-ink uppercase transition-all duration-300 active:scale-[0.98] hover:bg-signal-light disabled:opacity-60 [clip-path:polygon(0_0,100%_0,100%_72%,0_100%)]"
        >
          <span className="relative z-10 flex items-center gap-2.5">
            {state === 'loading' ? <Loader2 className="size-3.5 animate-spin" /> : <Lock className="size-3.5" strokeWidth={1.8} />}
            Activar 2FA
          </span>
        </button>
      ) : null}

      {enabled === false && setup ? (
        <div className="mt-7">
          <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={setup.qrDataUrl}
              alt="Código QR para el autenticador"
              width={240}
              height={240}
              className="border border-line bg-white p-2"
            />
            <div className="flex-1">
              <p className="text-[10px] font-semibold tracking-[0.2em] text-signal uppercase">
                1. Escanea el código QR
              </p>
              <p className="mt-1.5 text-[11px] leading-relaxed text-ash">
                Con tu aplicación de autenticación. Si no puedes escanearlo,
                introduce esta clave manualmente:
              </p>
              <code className="mt-2 flex items-center gap-2 border border-line bg-ink px-3 py-2 text-[11px] tracking-[0.18em] text-smoke select-all">
                <KeyRound className="size-3 shrink-0 text-ash" strokeWidth={1.7} />
                {setup.secret}
              </code>
            </div>
          </div>

          <label className="mt-6 block">
            <span className="text-[10px] font-semibold tracking-[0.2em] text-signal uppercase">
              2. Código de confirmación
            </span>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              inputMode="numeric"
              placeholder="000000"
              className="mt-2.5 w-full border border-line bg-ink py-3 text-center font-mono text-lg tracking-[0.4em] text-smoke outline-none transition-colors placeholder:text-ash/40 focus:border-signal"
            />
          </label>

          {error ? <ErrorNote error={error} /> : null}

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={confirmSetup}
              disabled={state === 'loading' || code.length < 6}
              className="btn-shine group relative inline-flex items-center gap-2.5 overflow-hidden bg-signal px-6 py-3.5 text-[10px] font-semibold tracking-[0.22em] text-ink uppercase transition-all duration-300 active:scale-[0.98] hover:bg-signal-light disabled:opacity-60 [clip-path:polygon(0_0,100%_0,100%_72%,0_100%)]"
            >
              <span className="relative z-10 flex items-center gap-2.5">
                {state === 'loading' ? <Loader2 className="size-3.5 animate-spin" /> : <ShieldCheck className="size-3.5" strokeWidth={1.8} />}
                Confirmar
              </span>
            </button>
            <button
              type="button"
              onClick={() => {
                setSetup(null);
                setCode('');
                setError('');
                setState('idle');
              }}
              disabled={state === 'loading'}
              className="inline-flex items-center gap-2 border border-line px-6 py-3.5 text-[10px] font-semibold tracking-[0.22em] text-ash uppercase transition-colors duration-300 hover:border-signal hover:text-signal disabled:opacity-60"
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : null}

      {enabled === true ? (
        <div className="mt-7 border-t border-line pt-6">
          <p className="text-[11px] leading-relaxed text-ash">
            Cada inicio de sesión pedirá un código de tu autenticador. Para
            desactivarlo, introduce un código válido.
          </p>
          <div className="mt-4 flex flex-wrap items-end gap-3">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              inputMode="numeric"
              placeholder="000000"
              className="w-40 border border-line bg-ink py-3 text-center font-mono text-base tracking-[0.3em] text-smoke outline-none transition-colors placeholder:text-ash/40 focus:border-signal"
            />
            <button
              type="button"
              onClick={confirmDisable}
              disabled={state === 'loading' || code.length < 6}
              className="inline-flex items-center gap-2 border border-line px-6 py-3 text-[10px] font-semibold tracking-[0.2em] text-ash uppercase transition-colors duration-300 hover:border-signal hover:text-signal active:scale-[0.98] disabled:opacity-60"
            >
              {state === 'loading' ? <Loader2 className="size-3.5 animate-spin" /> : <Lock className="size-3.5" strokeWidth={1.8} />}
              Desactivar
            </button>
          </div>
          {error ? <ErrorNote error={error} /> : null}
        </div>
      ) : null}
    </div>
  );
}

function Skeleton() {
  return <div className="mt-7 h-24 animate-pulse bg-ink-3" />;
}

function ErrorNote({ error }: { error: string }) {
  return (
    <p className="mt-4 border border-red-500/35 bg-red-500/8 px-4 py-2.5 text-[12px] text-red-300">
      {error}
    </p>
  );
}