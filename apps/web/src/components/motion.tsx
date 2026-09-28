'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  motion,
  useMotionValue,
  useSpring,
  useScroll,
  useTransform,
  AnimatePresence,
} from 'framer-motion';
import { cn } from '@/lib/utils';

/* ------------------------------------------------------------------ *
 * Custom cursor — Lamborghini signature move: a dot + trailing ring  *
 * ------------------------------------------------------------------ */

export function CustomCursor() {
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 380, damping: 34, mass: 0.55 });
  const sy = useSpring(y, { stiffness: 380, damping: 34, mass: 0.55 });
  const [label, setLabel] = useState<string | null>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return;
    setEnabled(true);

    const move = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      const el = (e.target as HTMLElement | null)?.closest<HTMLElement>('[data-cursor]');
      setLabel(el?.dataset.cursor ?? null);
    };
    window.addEventListener('pointermove', move, { passive: true });
    return () => window.removeEventListener('pointermove', move);
  }, [x, y]);

  if (!enabled) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] hidden md:block">
      <motion.div
        style={{ x: sx, y: sy }}
        className="absolute -translate-x-1/2 -translate-y-1/2"
      >
        <motion.div
          animate={{
            width: label ? 84 : 32,
            height: label ? 84 : 32,
            backgroundColor: label ? 'rgba(201,162,39,0.14)' : 'rgba(201,162,39,0.9)',
            borderColor: label ? 'rgba(201,162,39,0.85)' : 'rgba(201,162,39,0)',
          }}
          transition={{ type: 'spring', stiffness: 260, damping: 26 }}
          className="flex items-center justify-center rounded-full border backdrop-blur-[1px]"
        >
          {label ? (
            <motion.span
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-[10px] font-semibold tracking-[0.18em] text-signal uppercase"
            >
              {label}
            </motion.span>
          ) : null}
        </motion.div>
      </motion.div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Magnetic button — element drifts toward the pointer                 *
 * ------------------------------------------------------------------ */

export function Magnetic({
  children,
  strength = 0.28,
  className,
}: {
  children: ReactNode;
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(mx, { stiffness: 220, damping: 18 });
  const y = useSpring(my, { stiffness: 220, damping: 18 });

  return (
    <motion.div
      ref={ref}
      style={{ x, y }}
      className={cn('inline-block', className)}
      onPointerMove={(e) => {
        const rect = ref.current?.getBoundingClientRect();
        if (!rect) return;
        mx.set((e.clientX - (rect.left + rect.width / 2)) * strength);
        my.set((e.clientY - (rect.top + rect.height / 2)) * strength);
      }}
      onPointerLeave={() => {
        mx.set(0);
        my.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ *
 * Scroll reveal                                                        *
 * ------------------------------------------------------------------ */

export function Reveal({
  children,
  delay = 0,
  y = 34,
  className,
  once = true,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  once?: boolean;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: '-12% 0px -12% 0px' }}
      transition={{ duration: 0.85, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ *
 * Word-by-word headline reveal                                         *
 * ------------------------------------------------------------------ */

export function SplitWords({
  text,
  className,
  delay = 0,
  stagger = 0.045,
}: {
  text: string;
  className?: string;
  delay?: number;
  stagger?: number;
}) {
  const words = text.split(' ');
  return (
    <span className={cn('inline-block', className)}>
      {words.map((w, i) => (
        <span key={`${w}-${i}`} className="inline-block overflow-hidden align-bottom">
          <motion.span
            className="inline-block"
            initial={{ y: '110%', rotate: 3 }}
            animate={{ y: '0%', rotate: 0 }}
            transition={{
              duration: 1.05,
              delay: delay + i * stagger,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            {w}
            {i < words.length - 1 ? '\u00A0' : ''}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

/* ------------------------------------------------------------------ *
 * Parallax wrapper driven by scroll progress                            *
 * ------------------------------------------------------------------ */

export function Parallax({
  children,
  distance = 90,
  className,
}: {
  children: ReactNode;
  distance?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [distance, -distance]);
  return (
    <div ref={ref} className={cn('overflow-hidden', className)}>
      <motion.div style={{ y }} className="scale-110 will-change-transform">
        {children}
      </motion.div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Counter — animates a number when it enters the viewport             *
 * ------------------------------------------------------------------ */

export function Counter({
  to,
  duration = 1.6,
  suffix = '',
  prefix = '',
  decimals = 0,
}: {
  to: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [val, setVal] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || started.current) return;
        started.current = true;
        const start = performance.now();
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / (duration * 1000));
          const eased = 1 - Math.pow(1 - t, 4);
          setVal(to * eased);
          if (t < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );
    io.observe(node);
    return () => io.disconnect();
  }, [to, duration]);

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}
      {val.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
      {suffix}
    </span>
  );
}

/* ------------------------------------------------------------------ *
 * Page transition overlay (diagonal wipe)                              *
 * ------------------------------------------------------------------ */

export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

/* ------------------------------------------------------------------ *
 * Section label with the signal hairline                                *
 * ------------------------------------------------------------------ */

export function SectionLabel({ children, index }: { children: ReactNode; index?: string }) {
  return (
    <Reveal className="flex items-center gap-4">
      {index ? (
        <span className="font-display text-xs tracking-[0.3em] text-signal">{index}</span>
      ) : null}
      <span className="h-px w-10 bg-signal/50" />
      <span className="text-[11px] font-medium tracking-[0.34em] text-ash uppercase">{children}</span>
    </Reveal>
  );
}
