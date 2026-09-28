import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatPrice(value: number | string | null | undefined): string {
  const n = typeof value === 'string' ? Number.parseFloat(value) : (value ?? 0);
  if (!Number.isFinite(n)) return '—';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n);
}

export function formatMileage(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—';
  return `${new Intl.NumberFormat('en-US').format(value)} mi`;
}

export function discountPct(
  price: number | string | null | undefined,
  original: number | string | null | undefined,
): number | null {
  const p = typeof price === 'string' ? Number.parseFloat(price) : (price ?? 0);
  const o = typeof original === 'string' ? Number.parseFloat(original) : (original ?? 0);
  if (!o || o <= p) return null;
  return Math.round(((o - p) / o) * 100);
}
