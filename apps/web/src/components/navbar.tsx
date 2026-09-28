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
            <span className="hidden text-[9px] leading-tight tracking-[0.22em] text-ash uppercase sm:block">
              Import Premium
              <br />
              Vehicles
            </span>
          </Link>

          <ul className="hidden items-center gap-9 lg:flex">
            {links.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="group relative text-[11px] font-medium tracking-[0.22em] uppercase transition-colors duration-300 hover:text-brass"
                >
                  <span className={cn(path === l.href && 'text-brass')}>{l.label}</span>
                  <span
                    aria-hidden
                    className={cn(
                      'absolute -bottom-1.5 left-0 h-px w-0 bg-brass transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:w-full',
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
              className="hidden items-center gap-2 border border-brass/35 px-4 py-2.5 text-[10px] font-semibold tracking-[0.2em] text-brass uppercase transition-colors duration-300 hover:bg-brass hover:text-ink md:inline-flex"
            >
              <Phone className="size-3" strokeWidth={1.8} />
              Llamar
            </a>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
              className="flex size-10 items-center justify-center border border-line text-smoke transition-colors hover:border-brass hover:text-brass lg:hidden"
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
                    className="block border-b border-line py-5 font-display text-4xl text-smoke transition-colors hover:text-brass"
                  >
                    <span className="mr-3 align-super text-[10px] tracking-[0.2em] text-brass">
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
                <Phone className="size-4 text-brass" />
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

export function Wordmark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 24" fill="none" className={className} aria-label="JC Autoimport">
      <path
        d="M2 3.2h3.4v7.1c0 2.2 1.2 3.3 3.6 3.3s3.6-1.1 3.6-3.3V3.2H16v7.2c0 4.2-2.7 6.6-7 6.6S2 14.6 2 10.4V3.2Z"
        fill="currentColor"
      />
      <path
        d="M18.6 3.2h3.3v14.4h-3.3V3.2Zm0 0h8.2v3h-8.2v-3Zm0 5.7h7v2.9h-7V8.9Z"
        fill="currentColor"
      />
      <path d="M32 3.2h6v3h-6v-3Z" fill="#C9A227" />
    </svg>
  );
}
