import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '@/services/api';
import type { ProductQuery } from '@/services/api';
import { errorMessage } from '@/lib/errorMessage';
import type { Product } from '@/types';

interface ProductFeed {
  items: Product[];
  total: number;
  hasMore: boolean;
  loadingInitial: boolean;
  loadingMore: boolean;
  error: string | null;
  loadMore: () => void;
  retry: () => void;
}

/**
 * Paginated product feed for infinite scrolling. Resets and reloads page 1
 * whenever `query` changes, and appends subsequent pages via `loadMore`. Guards
 * against overlapping/duplicate fetches (including React StrictMode double-mount)
 * with an ignore flag per initial load and a loading ref for pagination.
 */
export function useProductFeed(query: ProductQuery, pageSize = 6): ProductFeed {
  const [items, setItems] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadNonce, setReloadNonce] = useState(0);

  const pageRef = useRef(1);
  const hasMoreRef = useRef(false);
  const loadingRef = useRef(false);

  useEffect(() => {
    let active = true;
    loadingRef.current = true;
    pageRef.current = 1;
    hasMoreRef.current = false;
    setLoadingInitial(true);
    setLoadingMore(false);
    setError(null);
    setItems([]);
    setHasMore(false);

    api
      .getProducts({ ...query, page: 1, pageSize })
      .then((res) => {
        if (!active) return;
        setItems(res.items);
        setTotal(res.total);
        setHasMore(res.hasMore);
        hasMoreRef.current = res.hasMore;
        pageRef.current = res.page;
      })
      .catch((err) => {
        if (active) setError(errorMessage(err));
      })
      .finally(() => {
        if (active) {
          setLoadingInitial(false);
          loadingRef.current = false;
        }
      });

    return () => {
      active = false;
    };
  }, [query, pageSize, reloadNonce]);

  const loadMore = useCallback(() => {
    if (loadingRef.current || !hasMoreRef.current) return;
    loadingRef.current = true;
    setLoadingMore(true);
    const nextPage = pageRef.current + 1;

    api
      .getProducts({ ...query, page: nextPage, pageSize })
      .then((res) => {
        setItems((prev) => [...prev, ...res.items]);
        setTotal(res.total);
        setHasMore(res.hasMore);
        hasMoreRef.current = res.hasMore;
        pageRef.current = res.page;
      })
      .catch((err) => setError(errorMessage(err)))
      .finally(() => {
        setLoadingMore(false);
        loadingRef.current = false;
      });
  }, [query, pageSize]);

  const retry = useCallback(() => setReloadNonce((n) => n + 1), []);

  return {
    items,
    total,
    hasMore,
    loadingInitial,
    loadingMore,
    error,
    loadMore,
    retry,
  };
}
