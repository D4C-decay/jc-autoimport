'use client';

import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import { Pause, Play } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Cinematic background loop for the hero.
 *
 * The clip is a 15 s cross-dissolve loop: the last second blends the end of the
 * shot back into the very first frame, so the loop point is 0.46% of the value
 * range away from where playback restarts (a real 0.5 s cut measures 4.59 on the
 * same scale) — i.e. visually seamless.
 *
 * The element is only mounted after hydration, so crawlers and the no-JS path
 * never download 3.4 MB of video and always paint the poster first.
 */
export function HeroVideo({
  src,
  poster,
  className,
  alt = '',
}: {
  src: string;
  poster: string;
  className?: string;
  alt?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [mounted, setMounted] = useState(false);
  const [playing, setPlaying] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => setMounted(true), []);

  // Stop decoding once the hero scrolls away; a looping video pinned out of view
  // keeps the compositor busy for nothing.
  useEffect(() => {
    if (!mounted || reduceMotion) return;
    const el = videoRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) void el.play().catch(() => undefined);
        else el.pause();
      },
      { threshold: 0.05 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [mounted, reduceMotion]);

  function toggle() {
    const el = videoRef.current;
    if (!el) return;
    if (el.paused) void el.play().then(() => setPlaying(true)).catch(() => undefined);
    else {
      el.pause();
      setPlaying(false);
    }
  }

  return (
    <>
      <video
        ref={videoRef}
        className={cn('absolute inset-0 size-full object-cover', className)}
        poster={poster}
        // eslint-disable-next-line jsx-a11y/media-has-caption
        aria-label={alt}
        muted
        loop
        playsInline
        preload="metadata"
        // Mounted only after hydration so the poster is what crawlers render.
        {...(mounted && !reduceMotion ? { autoPlay: true } : {})}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        style={{ display: mounted && !reduceMotion ? undefined : 'none' }}
      >
        <source src={src} type="video/mp4" />
      </video>

      {mounted && !reduceMotion ? (
        <button
          type="button"
          onClick={toggle}
          aria-label={playing ? 'Pausar el video de fondo' : 'Reproducir el video de fondo'}
          data-cursor={playing ? 'Pausa' : 'Play'}
          className="group absolute right-4 bottom-4 z-20 flex size-10 items-center justify-center border border-white/15 bg-ink/45 text-smoke/70 backdrop-blur-sm transition-colors duration-300 hover:border-signal/60 hover:text-signal md:right-8 md:bottom-8"
        >
          {playing ? (
            <Pause className="size-3.5" strokeWidth={1.6} />
          ) : (
            <Play className="size-3.5 translate-x-px" strokeWidth={1.6} />
          )}
        </button>
      ) : null}
    </>
  );
}
