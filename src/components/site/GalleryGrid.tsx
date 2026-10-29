'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { GalleryItem } from '@/lib/types';
import { Photo } from './Photo';

export function GalleryGrid({ items, categories, full }: { items: GalleryItem[]; categories?: string[]; full?: boolean }) {
  const [cat, setCat] = useState('All');
  const [open, setOpen] = useState<number | null>(null);
  const opener = useRef<HTMLButtonElement | null>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const touchX = useRef(0);

  // Keep the original index so placeholder colours stay stable while filtering.
  const shown = items.map((g, i) => ({ g, i })).filter(({ g }) => cat === 'All' || g.category === cat);

  const close = useCallback(() => {
    setOpen(null);
    opener.current?.focus();
  }, []);
  const step = useCallback((n: number) => setOpen((k) => (k === null ? k : (k + n + shown.length) % shown.length)), [shown.length]);

  useEffect(() => {
    if (open === null) return;
    closeBtn.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') step(-1);
      if (e.key === 'ArrowRight') step(1);
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, close, step]);

  const cur = open !== null ? shown[open] : null;
  const label = (g: GalleryItem, i: number) => g.caption || `${g.category || 'Photo'} · photo ${i + 1}`;

  return (
    <>
      {categories ? (
        <div className="fl" role="group" aria-label="Filter photos">
          {['All', ...categories].map((c) => (
            <button key={c} aria-pressed={cat === c} onClick={() => setCat(c)}>
              {c}
            </button>
          ))}
        </div>
      ) : null}
      {shown.length ? (
        <div className={`gl${full ? ' full' : ''}`}>
          {shown.map(({ g, i }, k) => (
            <button
              key={g.id}
              type="button"
              aria-label={`Open ${label(g, i)}`}
              onClick={(e) => {
                opener.current = e.currentTarget;
                setOpen(k);
              }}
              style={{ all: 'unset', cursor: 'pointer', display: 'block' }}
            >
              <Photo src={g.image} i={i} alt={g.caption} className={!g.image && i % 5 === 0 ? 'bw' : ''} sizes={full ? '(max-width:900px) 50vw, 25vw' : '(max-width:900px) 33vw, 20vw'} />
            </button>
          ))}
        </div>
      ) : (
        <p className="empty">No photos in this category yet.</p>
      )}

      <div
        id="md"
        className={cur ? 'on' : ''}
        role="dialog"
        aria-modal="true"
        aria-label="Photo viewer"
        onClick={(e) => e.target === e.currentTarget && close()}
        onTouchStart={(e) => (touchX.current = e.changedTouches[0].clientX)}
        onTouchEnd={(e) => {
          const dx = e.changedTouches[0].clientX - touchX.current;
          if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
        }}
      >
        {cur ? (
          <div className="bx">
            <button className="x" ref={closeBtn} onClick={close} aria-label="Close">
              ✕
            </button>
            <button className="ar2 pv" hidden={shown.length < 2} onClick={() => step(-1)} aria-label="Previous">
              ‹
            </button>
            <button className="ar2 nx" hidden={shown.length < 2} onClick={() => step(1)} aria-label="Next">
              ›
            </button>
            <Photo key={cur.g.id} src={cur.g.image} i={cur.i} alt={cur.g.caption} sizes="(max-width:900px) 100vw, 900px" />
            <p>
              {label(cur.g, cur.i)} · {(open ?? 0) + 1} / {shown.length}
            </p>
          </div>
        ) : null}
      </div>
    </>
  );
}
