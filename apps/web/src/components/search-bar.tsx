'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Search, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { api } from '@/lib/api';

type Suggestion = { brand: string; model: string; full: string };

export function SearchBar({
  autoFocus = false,
  placeholder = 'Buscar marca, modelo o categoría…',
  className,
}: {
  autoFocus?: boolean;
  placeholder?: string;
  className?: string;
}) {
  const router = useRouter();
  const [q, setQ] = useState('');
  const [items, setItems] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (q.trim().length < 2) {
      setItems([]);
      return;
    }
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const raw = await api.suggestions(q.trim(), 8);
        setItems(raw);
        setOpen(true);
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    }, 220);
    return () => clearTimeout(t);
  }, [q]);

  function submit(value: string) {
    const v = value.trim();
    if (!v) return;
    setOpen(false);
    router.push(`/catalogo?q=${encodeURIComponent(v)}`);
  }

  return (
    <div className={`relative ${className ?? ''}`}>
      <div className="flex items-center gap-3 border-b border-line pb-3 transition-colors duration-500 focus-within:border-signal">
        <Search className="size-4 shrink-0 text-signal" strokeWidth={1.7} />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => e.key === 'Enter' && submit(q)}
          onBlur={() => setTimeout(() => setOpen(false), 160)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="w-full bg-transparent text-sm text-smoke outline-none placeholder:text-ash/60"
        />
        {loading ? <Loader2 className="size-4 shrink-0 animate-spin text-ash" /> : null}
        {q ? (
          <button type="button" onClick={() => setQ('')} aria-label="Limpiar">
            <X className="size-4 shrink-0 text-ash hover:text-signal" />
          </button>
        ) : null}
      </div>

      <AnimatePresence>
        {open && items.length > 0 ? (
          <motion.ul
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22 }}
            className="absolute inset-x-0 top-full z-50 mt-2 border border-line bg-ink-2/97 backdrop-blur-xl"
          >
            {items.map((s) => (
              <li key={s.full}>
                <button
                  type="button"
                  onMouseDown={() => submit(s.full)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-ash transition-colors hover:bg-signal/8 hover:text-smoke"
                >
                  <span className="text-[10px] tracking-[0.18em] text-signal uppercase">
                    {s.brand}
                  </span>
                  <span className="text-smoke">{s.model}</span>
                </button>
              </li>
            ))}
          </motion.ul>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
