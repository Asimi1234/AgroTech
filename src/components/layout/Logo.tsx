import { cn } from '@/lib/cn';

export const Logo = ({
  className,
  onDark = false,
}: {
  className?: string;
  onDark?: boolean;
}) => (
  <span className={cn('flex items-center gap-2', className)}>
    <span
      className={cn(
        'flex h-8 w-8 items-center justify-center rounded-lg',
        onDark ? 'bg-brand-500 text-brand-900' : 'bg-brand-700 text-white',
      )}
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
        <path
          d="M12 3c4 3 5 7 3 11-2-1-3-3-3-6 0 3-1 5-3 6-2-4-1-8 3-11z"
          fill="currentColor"
        />
        <path
          d="M12 14v7"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </span>
    <span
      className={cn(
        'text-lg font-extrabold tracking-tight',
        onDark ? 'text-white' : 'text-slate-900',
      )}
    >
      Ojà<span className={onDark ? 'text-brand-300' : 'text-brand-700'}>Farm</span>
    </span>
  </span>
);
