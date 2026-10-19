'use client';

import { useEffect, useState, type CSSProperties } from 'react';
import { motion, useReducedMotion, type MotionValue, useTransform } from 'framer-motion';

interface ProcessExplodedProps {
  progress: MotionValue<number>;
  active: number;
  className?: string;
}

export function ProcessExploded({ progress, active, className = '' }: ProcessExplodedProps) {
  const reduce = useReducedMotion();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Simple offsets for 5 layers (pseudo-disassembly)
  const t0 = useTransform(progress, [0, 1], [0, 0]);
  const t1x = useTransform(progress, [0, 1], [0, 40]);
  const t1y = useTransform(progress, [0, 1], [0, -20]);
  const t2x = useTransform(progress, [0, 1], [0, -35]);
  const t2y = useTransform(progress, [0, 1], [0, 25]);
  const t3x = useTransform(progress, [0, 1], [0, 30]);
  const t3y = useTransform(progress, [0, 1], [0, 40]);
  const t4x = useTransform(progress, [0, 1], [0, -25]);
  const t4y = useTransform(progress, [0, 1], [0, -35]);

  const baseStyle: CSSProperties = reduce || !mounted ? { transition: 'none' } : {};

  return (
    <div className={`relative aspect-square w-full ${className}`}>
      <svg viewBox="0 0 400 400" role="img" aria-label="Despiece animado de vehículo 1→5" className="h-full w-full">
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {/* 0 - Base (montado) */}
        <motion.g
          style={{ ...baseStyle, x: t0, y: t0, opacity: useTransform(progress, [0, 0.2], [1, 0.9]) }}
          data-active={active >= 0}
        >
          <circle cx="200" cy="200" r="70" stroke="var(--color-line)" strokeWidth="6" fill="none" />
          <circle cx="200" cy="200" r="48" stroke="var(--color-ash)" strokeWidth="4" fill="none" />
          <circle cx="200" cy="200" r="26" stroke="var(--color-line)" strokeWidth="3" fill="none" />
        </motion.g>
        {/* 1 - Disco/freno */}
        <motion.g
          style={{ ...baseStyle, x: t1x, y: t1y }}
          filter={active >= 1 && mounted ? 'url(#glow)' : undefined}
        >
          <circle cx="200" cy="200" r="58" stroke={active >= 1 ? 'var(--color-signal)' : 'var(--color-line)'} strokeWidth="5" fill="none" opacity="0.9" />
        </motion.g>
        {/* 2 - Pinza */}
        <motion.g
          style={{ ...baseStyle, x: t2x, y: t2y }}
          filter={active >= 2 && mounted ? 'url(#glow)' : undefined}
        >
          <rect x="132" y="188" width="16" height="24" rx="3" stroke={active >= 2 ? 'var(--color-signal)' : 'var(--color-line)'} strokeWidth="3" fill="none" opacity="0.95" />
        </motion.g>
        {/* 3 - Suspensión */}
        <motion.g
          style={{ ...baseStyle, x: t3x, y: t3y }}
          filter={active >= 3 && mounted ? 'url(#glow)' : undefined}
        >
          <line x1="200" y1="130" x2="230" y2="110" stroke={active >= 3 ? 'var(--color-signal)' : 'var(--color-line)'} strokeWidth="4" strokeLinecap="round" opacity="0.95" />
          <line x1="170" y1="270" x2="150" y2="290" stroke={active >= 3 ? 'var(--color-signal)' : 'var(--color-line)'} strokeWidth="4" strokeLinecap="round" opacity="0.95" />
        </motion.g>
        {/* 4 - Soportes/pernos */}
        <motion.g
          style={{ ...baseStyle, x: t4x, y: t4y }}
          filter={active >= 4 && mounted ? 'url(#glow)' : undefined}
        >
          <circle cx="248" cy="200" r="4" fill={active >= 4 ? 'var(--color-signal)' : 'var(--color-ash)'} />
          <circle cx="152" cy="200" r="4" fill={active >= 4 ? 'var(--color-signal)' : 'var(--color-ash)'} />
          <circle cx="200" cy="248" r="4" fill={active >= 4 ? 'var(--color-signal)' : 'var(--color-ash)'} />
          <circle cx="200" cy="152" r="4" fill={active >= 4 ? 'var(--color-signal)' : 'var(--color-ash)'} />
        </motion.g>
      </svg>
    </div>
  );
}

export default ProcessExploded;
