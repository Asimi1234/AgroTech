import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/cn';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  wrapperClassName?: string;
}

/**
 * Defers image loading until the element approaches the viewport, then fades it
 * in once decoded. Falls back to native `loading="lazy"` where the observer is
 * unavailable, keeping listing pages fast on low-end mobile devices.
 */
export const LazyImage = ({
  src,
  alt,
  className,
  wrapperClassName,
}: LazyImageProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setInView(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin: '200px' },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn('relative overflow-hidden bg-earth-100', wrapperClassName)}
    >
      {!loaded && <div className="absolute inset-0 skeleton rounded-none" />}
      {inView && (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          className={cn(
            'h-full w-full object-cover transition-opacity duration-300',
            loaded ? 'opacity-100' : 'opacity-0',
            className,
          )}
        />
      )}
    </div>
  );
};
