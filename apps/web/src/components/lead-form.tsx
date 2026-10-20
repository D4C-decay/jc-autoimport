'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Loader2, Send } from 'lucide-react';
import { api, type LeadType } from '@/lib/api';
import { cn } from '@/lib/utils';

const TYPES: Array<{ value: LeadType; label: string }> = [
  { value: 'QUOTATION', label: 'Cotización' },
  { value: 'TEST_DRIVE', label: 'Prueba de manejo' },
  { value: 'FINANCING', label: 'Financiamiento' },
  { value: 'GENERAL_INQUIRY', label: 'Consulta general' },
];

type State = 'idle' | 'sending' | 'sent' | 'error';

export function LeadForm({
  vehicleId,
  vehicleName,
  defaultType = 'GENERAL_INQUIRY',
  cta = 'Enviar solicitud',
  compact = false,
}: {
  vehicleId?: string;
  vehicleName?: string;
  defaultType?: LeadType;
  cta?: string;
  compact?: boolean;
}) {
  const [type, setType] = useState<LeadType>(defaultType);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [state, setState] = useState<State>('idle');
  const [error, setError] = useState('');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState('sending');
    setError('');
    try {
      await api.createLead({
        vehicleId,
        customerName: name,
        customerEmail: email,
        customerPhone: phone || undefined,
        message: message || undefined,
        leadType: type,
        source: 'web',
      });
      setState('sent');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No pudimos enviar tu solicitud.');
      setState('error');
    }
  }

  if (state === 'sent') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="border border-signal/35 bg-signal/8 p-7 text-center"
      >
        <span className="mx-auto flex size-11 items-center justify-center rounded-full border border-signal text-signal">
          <Check className="size-5" strokeWidth={2.2} />
        </span>
        <h3 className="mt-4 font-display text-lg text-smoke">Solicitud recibida</h3>
        <p className="mt-2 text-[13px] leading-relaxed text-ash">
          Un asesor te contactará en menos de 24 horas
          {vehicleName ? (
            <>
              {' '}
              sobre <span className="text-signal">{vehicleName}</span>
            </>
          ) : null}
          . También te escribiremos por WhatsApp.
        </p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={onSubmit} className={cn('space-y-4', compact && 'text-sm')}>
      <div>
        <span className="text-[10px] font-semibold tracking-[0.2em] text-signal uppercase">
          Motivo de contacto
        </span>
        <div className="mt-2.5 flex flex-wrap gap-2">
          {TYPES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setType(t.value)}
              className={cn(
                'border px-3 py-3 text-[10px] font-medium tracking-[0.14em] uppercase transition-colors duration-300 sm:py-2',
                type === t.value
                  ? 'border-signal bg-signal/12 text-signal'
                  : 'border-line text-ash hover:border-signal/50 hover:text-smoke',
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Nombre completo"
          value={name}
          onChange={setName}
          required
          placeholder="Juan Pérez"
          autoComplete="name"
        />
        <Field
          label="Teléfono / WhatsApp"
          value={phone}
          onChange={setPhone}
          placeholder="+1 809 555 0100"
          autoComplete="tel"
        />
      </div>

      <Field
        label="Correo electrónico"
        type="email"
        value={email}
        onChange={setEmail}
        required
        placeholder="juan@correo.com"
        autoComplete="email"
      />

      <label className="block">
        <span className="text-[10px] font-semibold tracking-[0.2em] text-signal uppercase">
          Mensaje {vehicleName ? <span className="text-ash/60 normal-case">(opcional)</span> : null}
        </span>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={compact ? 3 : 4}
          placeholder={
            vehicleName
              ? 'Me interesa este vehículo. Quisiera saber disponibilidad y opciones de financiamiento…'
              : 'Cuéntanos qué vehículo buscas, presupuesto y prazo.'
          }
          className="mt-2.5 w-full resize-none border border-line bg-ink px-4 py-3 text-base text-smoke sm:text-sm outline-none transition-colors placeholder:text-ash/50 focus:border-signal"
        />
      </label>

      <AnimatePresence>
        {state === 'error' && error ? (
          <motion.p
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="border border-red-500/35 bg-red-500/8 px-4 py-2.5 text-[12px] text-red-300"
          >
            {error}
          </motion.p>
        ) : null}
      </AnimatePresence>

      <button
        type="submit"
        disabled={state === 'sending'}
        className="btn-shine group relative flex w-full items-center justify-center gap-2.5 overflow-hidden bg-signal px-8 py-4 text-[11px] font-semibold tracking-[0.24em] text-ink uppercase transition-all duration-300 active:scale-[0.98] hover:bg-signal-light disabled:opacity-60 [clip-path:polygon(0_0,100%_0,100%_72%,0_100%)]"
      >
        <span className="relative z-10 flex items-center gap-2.5">
          {state === 'sending' ? <Loader2 className="size-3.5 animate-spin" /> : <Send className="size-3.5" strokeWidth={1.8} />}
          {state === 'sending' ? 'Enviando…' : cta}
        </span>
      </button>

      <p className="text-[10px] leading-relaxed text-ash/70">
        Al enviar aceptas que te contactemos por teléfono, correo o WhatsApp. No compartimos tus datos
        con terceros.
      </p>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  required,
  placeholder,
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
  autoComplete?: string;
}) {
  return (
    <label className="block">
      <span className="text-[10px] font-semibold tracking-[0.2em] text-signal uppercase">
        {label}
        {required ? <span className="ml-1 text-signal/60">*</span> : null}
      </span>
      <input
        type={type}
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="mt-2.5 w-full border border-line bg-ink px-4 py-3 text-base text-smoke sm:text-sm outline-none transition-colors placeholder:text-ash/50 focus:border-signal"
      />
    </label>
  );
}
