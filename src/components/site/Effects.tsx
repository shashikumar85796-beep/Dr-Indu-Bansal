'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

const reduced = () => matchMedia('(prefers-reduced-motion:reduce)').matches;

function countUp(b: HTMLElement) {
  const n = Number(b.dataset.n);
  const suffix = b.dataset.s || '';
  if (reduced() || !n) return;
  let t0: number | null = null;
  const step = (t: number) => {
    if (t0 === null) t0 = t;
    const p = Math.min(1, (t - t0) / 1300);
    b.textContent = Math.round(n * (1 - Math.pow(1 - p, 3))) + (p === 1 ? suffix : '');
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

/** Scroll-reveal for `.rv` sections and count-up for `[data-n]` figures, re-armed on every page. */
export function Effects() {
  const path = usePathname();
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          e.target.classList.add('in');
          io.unobserve(e.target);
          e.target.querySelectorAll<HTMLElement>('[data-n]').forEach(countUp);
        }),
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
    );
    document.querySelectorAll('.rv:not(.in)').forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [path]);
  return null;
}
