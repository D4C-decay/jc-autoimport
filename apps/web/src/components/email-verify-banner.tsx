'use client';

import { useState } from 'react';
import { AlertTriangle, Loader2, MailCheck } from 'lucide-react';
import { api } from '@/lib/api';

export function EmailVerifyBanner({ email }: { email: string }) {
  const [state, setState] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle');

  async function resend() {
    setState('loading');
    try {
      await api.resendVerification(email);
      setState('sent');
    } catch {
      setState('error');
    }
  }

  return (
    <div className="mb-6 flex flex-col gap-4 border border-signal/30 bg-signal/8 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 size-4 shrink-0 text-signal" strokeWidth={1.8} />
        <div>
          <p className="text-sm text-smoke">Confirma tu correo electrónico</p>
          <p className="mt-1 text-[12px] text-ash">
            {state === 'sent'
              ? 'Te reenviamos el enlace de confirmación. Revisa tu bandeja de entrada.'
              : state === 'error'
                ? 'No se pudo reenviar el correo. Inténtalo de nuevo en unos minutos.'
                : `Aún no verificas ${email}. Confírmalo para completar tu cuenta.`}
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={resend}
        disabled={state === 'loading' || state === 'sent'}
        className="inline-flex shrink-0 items-center justify-center gap-2 border border-signal px-5 py-2.5 text-[10px] font-semibold tracking-[0.2em] text-signal uppercase transition-colors active:scale-[0.98] hover:bg-signal hover:text-ink disabled:opacity-60"
      >
        {state === 'loading' ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : (
          <MailCheck className="size-3.5" strokeWidth={1.8} />
        )}
        {state === 'sent' ? 'Enviado' : 'Reenviar'}
      </button>
    </div>
  );
}
