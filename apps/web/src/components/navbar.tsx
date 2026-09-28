'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, Phone, X } from 'lucide-react';
import { CONTACT_PHONE_HREF } from '@/lib/site';
import { cn } from '@/lib/utils';

const links = [
  { href: '/', label: 'Inicio' },
  { href: '/catalogo', label: 'Catálogo' },
  { href: '/proceso', label: 'Proceso' },
  { href: '/contacto', label: 'Contacto' },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [path, setPath] = useState('');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    setPath(window.location.pathname);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <>
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-[200] transition-all duration-500',
          scrolled
            ? 'border-b border-line/70 bg-ink/82 backdrop-blur-xl'
            : 'border-b border-transparent',
        )}
      >
        <nav className="container-x flex h-18 items-center justify-between py-4">
          <Link href="/" className="group flex items-center gap-3" data-cursor="Inicio">
            <Wordmark className="h-6" />
            <span className="font-display text-sm leading-none tracking-[0.14em] text-smoke uppercase transition-colors duration-300 group-hover:text-signal">
              JC Autoimport
            </span>
          </Link>

          <ul className="hidden items-center gap-9 lg:flex">
            {links.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="group relative text-[11px] font-medium tracking-[0.22em] uppercase transition-colors duration-300 hover:text-signal"
                >
                  <span className={cn(path === l.href && 'text-signal')}>{l.label}</span>
                  <span
                    aria-hidden
                    className={cn(
                      'absolute -bottom-1.5 left-0 h-px w-0 bg-signal transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:w-full',
                      path === l.href && 'w-full',
                    )}
                  />
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-3">
            <a
              href={CONTACT_PHONE_HREF}
              data-cursor="Llamar"
              className="hidden items-center gap-2 border border-signal/35 px-4 py-2.5 text-[10px] font-semibold tracking-[0.2em] text-signal uppercase transition-colors duration-300 hover:bg-signal hover:text-ink md:inline-flex"
            >
              <Phone className="size-3" strokeWidth={1.8} />
              Llamar
            </a>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
              className="flex size-10 items-center justify-center border border-line text-smoke transition-colors hover:border-signal hover:text-signal lg:hidden"
            >
              {open ? <X className="size-4" /> : <Menu className="size-4" />}
            </button>
          </div>
        </nav>
      </header>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ clipPath: 'inset(0 0 100% 0)' }}
            animate={{ clipPath: 'inset(0 0 0% 0)' }}
            exit={{ clipPath: 'inset(0 0 100% 0)' }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[190] bg-ink lg:hidden"
          >
            <div className="container-x flex h-full flex-col justify-center gap-2 pt-18">
              {links.map((l, i) => (
                <motion.div
                  key={l.href}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.08, duration: 0.6 }}
                >
                  <Link
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="block border-b border-line py-5 font-display text-4xl text-smoke transition-colors hover:text-signal"
                  >
                    <span className="mr-3 align-super text-[10px] tracking-[0.2em] text-signal">
                      0{i + 1}
                    </span>
                    {l.label}
                  </Link>
                </motion.div>
              ))}
              <a
                href={CONTACT_PHONE_HREF}
                className="mt-10 flex items-center gap-2 text-smoke"
              >
                <Phone className="size-4 text-signal" />
                {CONTACT_PHONE_HREF}
              </a>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}

/* ----------------------------- Wordmark SVG ----------------------------- */

/**
 * Monogram "JC". Drawn as filled geometry (no font) so it never depends on a
 * webfont being loaded, and it stays crisp at any size.
 */
export function Wordmark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 44 24" fill="none" className={className} aria-label="JC Autoimport">
      <path
        d="M13 4h4v11c0 3.3-2.3 5.5-5.8 5.5H6v-4h4.6c1.5 0 2.4-.6 2.4-2.1V4Z"
        fill="currentColor"
      />
      <path d="M24 4h16v4.2H28.2v7.6H40v4.2H24V4Z" fill="currentColor" />
      <path d="M35.6 15.8H40v4.2h-4.4V15.8Z" fill="#f02434" />
    </svg>
  );
}
