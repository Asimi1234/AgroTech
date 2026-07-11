import type { ReactNode } from 'react';
import { Icon } from '@/components/ui/Icon';
import type { IconName } from '@/components/ui/Icon';
import { cn } from '@/lib/cn';

interface StatTileProps {
  icon: IconName;
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  className?: string;
}

/**
 * A single headline figure — the "stat tile" form. Presentational only; wrap in a
 * Link where the tile should navigate.
 */
export const StatTile = ({
  icon,
  label,
  value,
  hint,
  className,
}: StatTileProps) => (
  <div
    className={cn(
      'flex h-full flex-col rounded-xl border border-earth-200 bg-white p-4 shadow-sm',
      className,
    )}
  >
    <div className="flex items-center gap-2 text-slate-500">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
        <Icon name={icon} className="h-5 w-5" />
      </span>
      <span className="text-sm font-medium">{label}</span>
    </div>
    <p className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900">
      {value}
    </p>
    {hint && <div className="mt-1 text-sm text-slate-500">{hint}</div>}
  </div>
);
