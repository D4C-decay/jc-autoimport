'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';
import { THEME_STORAGE_KEY } from '@/lib/theme';

/**
 * Interruptor de tema claro/oscuro. El modo oscuro es el de por defecto; el
 * script anti-FOUC de `layout.tsx` aplica `data-theme="light"` antes de pintar
 * para que no haya parpadeo.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const [light, setLight] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setLight(document.documentElement.getAttribute('data-theme') === 'light');
  }, []);

  function toggle() {
    const next = light ? 'dark' : 'light';
    const root = document.documentElement;
    if (next === 'light') root.setAttribute('data-theme', 'light');
    else root.removeAttribute('data-theme');
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      /* almacenamiento no disponible */
    }
    setLight(!light);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={light ? 'Activar modo oscuro' : 'Activar modo claro'}
      title={light ? 'Modo oscuro' : 'Modo claro'}
      className={cn(
        'flex size-10 items-center justify-center border border-line text-smoke transition-colors duration-300 hover:border-signal hover:text-signal active:scale-95',
        className,
      )}
    >
      {mounted && light ? (
        <Moon className="size-4" strokeWidth={1.8} />
      ) : (
        <Sun className="size-4" strokeWidth={1.8} />
      )}
    </button>
  );
}
