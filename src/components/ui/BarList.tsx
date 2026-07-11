import { cn } from '@/lib/cn';

export interface BarListItem {
  label: string;
  value: number;
}

interface BarListProps {
  items: BarListItem[];
  formatValue?: (value: number) => string;
  className?: string;
}

/**
 * A compact horizontal bar chart for ranked magnitudes: one hue, bars scaled to
 * the largest value, each labelled directly. Marks animate width on mount and
 * hold still under prefers-reduced-motion (handled in animations.css).
 */
export const BarList = ({ items, formatValue, className }: BarListProps) => {
  const max = Math.max(1, ...items.map((i) => i.value));
  return (
    <ul className={cn('space-y-3', className)}>
      {items.map((item) => {
        const pct = Math.round((item.value / max) * 100);
        return (
          <li key={item.label}>
            <div className="mb-1 flex items-baseline justify-between gap-2">
              <span className="text-sm font-medium text-slate-700">
                {item.label}
              </span>
              <span className="text-sm font-bold tabular-nums text-slate-900">
                {formatValue ? formatValue(item.value) : item.value}
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-earth-100">
              <div
                className="bar-fill h-full rounded-full bg-brand-600"
                style={{ width: `${Math.max(pct, 4)}%` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
};
