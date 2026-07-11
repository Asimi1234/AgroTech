import { cn } from '@/lib/cn';

interface StarRatingProps {
  rating: number;
  reviewCount?: number;
  size?: 'sm' | 'md';
  showNumber?: boolean;
}

const Star = ({ fill, sizeClass }: { fill: number; sizeClass: string }) => (
  <span className={cn('relative inline-block', sizeClass)} aria-hidden="true">
    <svg viewBox="0 0 20 20" className="h-full w-full text-earth-300">
      <path
        fill="currentColor"
        d="M10 1.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L10 15.9l-5.2 2.7 1-5.8L1.5 7.7l5.9-.9z"
      />
    </svg>
    <span
      className="absolute inset-0 overflow-hidden"
      style={{ width: `${fill * 100}%` }}
    >
      <svg viewBox="0 0 20 20" className="h-full w-full text-amber-500">
        <path
          fill="currentColor"
          d="M10 1.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L10 15.9l-5.2 2.7 1-5.8L1.5 7.7l5.9-.9z"
        />
      </svg>
    </span>
  </span>
);

export const StarRating = ({
  rating,
  reviewCount,
  size = 'md',
  showNumber = true,
}: StarRatingProps) => {
  const sizeClass = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';
  const stars = [0, 1, 2, 3, 4].map((i) =>
    Math.max(0, Math.min(1, rating - i)),
  );

  return (
    <div
      className="flex items-center gap-1.5"
      aria-label={`Rated ${rating.toFixed(1)} out of 5${
        reviewCount ? ` from ${reviewCount} reviews` : ''
      }`}
    >
      <span className="flex gap-0.5">
        {stars.map((fill, i) => (
          <Star key={i} fill={fill} sizeClass={sizeClass} />
        ))}
      </span>
      {showNumber && (
        <span className="text-sm font-semibold text-slate-800">
          {rating.toFixed(1)}
          {typeof reviewCount === 'number' && (
            <span className="font-normal text-slate-500"> ({reviewCount})</span>
          )}
        </span>
      )}
    </div>
  );
};
