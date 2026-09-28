import Link from 'next/link';
import { cn } from '@/lib/utils';

/* --------------------------------- Button -------------------------------- */

type ButtonVariant = 'solid' | 'outline' | 'ghost';

const base =
  'group relative inline-flex items-center justify-center gap-2.5 overflow-hidden px-8 py-4 text-[11px] font-semibold tracking-[0.24em] uppercase transition-all duration-500 [clip-path:polygon(0_0,100%_0,100%_72%,0_100%)]';

const variants: Record<ButtonVariant, string> = {
  solid: 'bg-signal text-ink hover:bg-signal-light',
  outline: 'border border-signal/45 text-signal hover:border-signal hover:bg-signal/8',
  ghost: 'text-smoke/80 hover:text-signal',
};

export function Button({
  href,
  children,
  variant = 'solid',
  className,
  cursor,
  onClick,
  type = 'button',
  disabled,
}: {
  href?: string;
  children: React.ReactNode;
  variant?: ButtonVariant;
  className?: string;
  cursor?: string;
  onClick?: () => void;
  type?: 'button' | 'submit';
  disabled?: boolean;
}) {
  const cls = cn(base, variants[variant], 'btn-shine', disabled && 'opacity-50', className);
  const inner = (
    <>
      <span className="relative z-10">{children}</span>
      <span
        aria-hidden
        className="absolute inset-0 origin-bottom scale-y-0 bg-smoke transition-transform duration-500 [clip-path:polygon(0_0,100%_0,100%_72%,0_100%)] group-hover:scale-y-100"
      />
      {variant === 'solid' ? (
        <span
          aria-hidden
          className="absolute inset-0 origin-bottom scale-y-0 bg-ink transition-transform duration-500 [clip-path:polygon(0_0,100%_0,100%_72%,0_100%)] group-hover:scale-y-100"
        />
      ) : null}
    </>
  );

  if (href) {
    const external = href.startsWith('http');
    const props = external ? { target: '_blank', rel: 'noreferrer' } : {};
    return (
      <Link
        href={href}
        data-cursor={cursor}
        className={cls}
        {...(external ? props : {})}
      >
        {inner}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} data-cursor={cursor} className={cls}>
      {inner}
    </button>
  );
}

/* --------------------------------- Eyebrow -------------------------------- */

export function Eyebrow({
  children,
  index,
  className,
}: {
  children: React.ReactNode;
  index?: string;
  className?: string;
}) {
  return (
    <div className={cn('flex items-center gap-4', className)}>
      {index ? <span className="text-xs tracking-[0.3em] text-signal">{index}</span> : null}
      <span className="h-px w-10 bg-signal/50" />
      <span className="text-[11px] font-medium tracking-[0.34em] text-ash uppercase">{children}</span>
    </div>
  );
}

/* --------------------------------- Status --------------------------------- */

const statusStyles: Record<string, string> = {
  AVAILABLE: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25',
  RESERVED: 'bg-amber-500/15 text-amber-300 border-amber-500/25',
  SOLD: 'bg-white/5 text-ash border-white/10',
};

export function StatusBadge({ status, label }: { status: string; label: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 border px-2.5 py-1 text-[9px] font-semibold tracking-[0.18em] uppercase',
        statusStyles[status] ?? statusStyles.SOLD,
      )}
    >
      <span className="size-1 rounded-full bg-current" />
      {label}
    </span>
  );
}
