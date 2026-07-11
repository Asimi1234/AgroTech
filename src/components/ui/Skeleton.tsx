import { cn } from '@/lib/cn';

export const Skeleton = ({ className }: { className?: string }) => (
  <div className={cn('skeleton', className)} aria-hidden="true" />
);

export const SkeletonText = ({ lines = 3 }: { lines?: number }) => (
  <div className="space-y-2" aria-hidden="true">
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton
        key={i}
        className={cn('h-4', i === lines - 1 ? 'w-2/3' : 'w-full')}
      />
    ))}
  </div>
);

export const ProductCardSkeleton = () => (
  <div className="overflow-hidden rounded-xl border border-earth-200 bg-white">
    <Skeleton className="h-40 w-full rounded-none" />
    <div className="space-y-3 p-4">
      <Skeleton className="h-5 w-4/5" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-6 w-1/3" />
      <Skeleton className="h-10 w-full" />
    </div>
  </div>
);
