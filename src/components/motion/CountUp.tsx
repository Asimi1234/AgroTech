import { useEffect, useRef, useState } from 'react';

interface CountUpProps {
  end: number;
  prefix?: string;
  suffix?: string;
  durationMs?: number;
  className?: string;
}

const prefersReducedMotion = (): boolean =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

export const CountUp = ({
  end,
  prefix = '',
  suffix = '',
  durationMs = 1400,
  className,
}: CountUpProps) => {
  const ref = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState(0);

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === 'undefined' || prefersReducedMotion()) {
      setValue(end);
      return;
    }

    let frame = 0;
    let started = false;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || started) return;
        started = true;
        observer.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const progress = Math.min(1, (now - start) / durationMs);
          const eased = 1 - Math.pow(1 - progress, 3);
          setValue(end * eased);
          if (progress < 1) frame = requestAnimationFrame(tick);
          else setValue(end);
        };
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );
    observer.observe(node);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [end, durationMs]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {Math.round(value).toLocaleString('en-NG')}
      {suffix}
    </span>
  );
};
