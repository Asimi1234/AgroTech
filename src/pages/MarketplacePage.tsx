import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PageHeading } from '@/components/ui/PageHeading';
import { ProductCardSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { ProductCard } from '@/components/marketplace/ProductCard';
import {
  MarketplaceFilters,
  MAX_PRICE,
  defaultFilters,
} from '@/components/marketplace/MarketplaceFilters';
import type { MarketFilters } from '@/components/marketplace/MarketplaceFilters';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useProductFeed } from '@/hooks/useProductFeed';
import type { ProductQuery } from '@/services/api';

const PAGE_SIZE = 12;

const SkeletonGrid = ({ count }: { count: number }) => (
  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
    {Array.from({ length: count }).map((_, i) => (
      <ProductCardSkeleton key={i} />
    ))}
  </div>
);

export const MarketplacePage = () => {
  const { t } = useTranslation('marketplace');
  const [filters, setFilters] = useState<MarketFilters>(defaultFilters);
  const debounced = useDebouncedValue(filters, 300);

  const query = useMemo<ProductQuery>(
    () => ({
      cropType: debounced.cropType,
      region: debounced.region,
      maxPrice: debounced.maxPrice < MAX_PRICE ? debounced.maxPrice : undefined,
      sort: debounced.sort,
      search: debounced.search.trim() || undefined,
    }),
    [debounced],
  );

  const {
    items,
    total,
    hasMore,
    loadingInitial,
    loadingMore,
    error,
    loadMore,
    retry,
  } = useProductFeed(query, PAGE_SIZE);

  const sentinelRef = useRef<HTMLDivElement>(null);

  // Re-observing on items.length ensures a sentinel that stays in view after a
  // page loads re-fires (IntersectionObserver emits no event without a fresh
  // enter/leave transition), so the final page loads even at the page bottom.
  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore();
      },
      { rootMargin: '400px' },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [loadMore, hasMore, items.length]);

  return (
    <div>
      <PageHeading title={t('title')} subtitle={t('subtitle')} />

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <div className="lg:sticky lg:top-20 lg:self-start">
          <MarketplaceFilters
            filters={filters}
            onChange={setFilters}
            resultCount={total}
          />
        </div>

        <div>
          {loadingInitial && <SkeletonGrid count={PAGE_SIZE} />}

          {error && !loadingInitial && items.length === 0 && (
            <ErrorState message={error} onRetry={retry} />
          )}

          {!loadingInitial && !error && items.length === 0 && (
            <EmptyState
              title={t('empty.title')}
              message={t('empty.message')}
              action={
                <Button
                  variant="outline"
                  onClick={() => setFilters(defaultFilters)}
                >
                  {t('empty.clear')}
                </Button>
              }
            />
          )}

          {!loadingInitial && items.length > 0 && (
            <>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {items.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {loadingMore && (
                <div className="mt-4">
                  <SkeletonGrid count={Math.min(PAGE_SIZE, total - items.length) || 3} />
                </div>
              )}

              {error && !loadingMore && (
                <div className="mt-4">
                  <ErrorState message={error} onRetry={loadMore} />
                </div>
              )}

              {/* Sentinel: entering the viewport triggers the next page. */}
              {hasMore && <div ref={sentinelRef} aria-hidden="true" className="h-1" />}

              <p
                className="mt-6 text-center text-sm text-slate-500"
                role="status"
                aria-live="polite"
              >
                {loadingMore ? (
                  <span className="inline-flex items-center gap-2">
                    <Spinner className="h-4 w-4 text-brand-700" />
                    {t('feed.loadingMore')}
                  </span>
                ) : hasMore ? (
                  t('feed.showing', { shown: items.length, total })
                ) : (
                  t('feed.all', { total })
                )}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MarketplacePage;
