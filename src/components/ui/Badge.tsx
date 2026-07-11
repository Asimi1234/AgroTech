import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

type Tone = 'neutral' | 'brand' | 'earth' | 'success' | 'warning' | 'danger';

const tones: Record<Tone, string> = {
  neutral: 'bg-slate-100 text-slate-700',
  brand: 'bg-brand-100 text-brand-800',
  earth: 'bg-earth-100 text-earth-800',
  success: 'bg-green-100 text-green-800',
  warning: 'bg-amber-100 text-amber-900',
  danger: 'bg-red-100 text-red-800',
};

export const Badge = ({
  children,
  tone = 'neutral',
  className,
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) => (
  <span
    className={cn(
      'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
      tones[tone],
      className,
    )}
  >
    {children}
  </span>
);
