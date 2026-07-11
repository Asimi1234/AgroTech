import { useEffect } from 'react';
import type { RefObject } from 'react';

const clamp = (value: number) => Math.max(0, Math.min(1, value));

export function useDocumentScrollProgress(
  barRef: RefObject<HTMLElement | null>,
): void {
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      const progress = max > 0 ? clamp(doc.scrollTop / max) : 0;
      if (barRef.current) {
        barRef.current.style.transform = `scaleX(${progress})`;
      }
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(frame);
    };
  }, [barRef]);
}

export function useSectionFill(
  targetRef: RefObject<HTMLElement | null>,
  fillRef: RefObject<HTMLElement | null>,
): void {
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const target = targetRef.current;
      const fill = fillRef.current;
      if (!target || !fill) return;
      const rect = target.getBoundingClientRect();
      const vh = window.innerHeight;
      const start = vh * 0.8;
      const span = vh * 0.5;
      const progress = clamp((start - rect.top) / span);
      fill.style.transform = `scaleX(${progress})`;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(frame);
    };
  }, [targetRef, fillRef]);
}
