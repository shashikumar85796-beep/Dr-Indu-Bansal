'use client';

import { useDeferredValue, useState } from 'react';
import type { Story } from '@/lib/types';
import { StoryCard } from './blocks';

export function UpdatesBrowser({ stories }: { stories: Story[] }) {
  const [cat, setCat] = useState('All');
  const [q, setQ] = useState('');
  const query = useDeferredValue(q.trim().toLowerCase());
  const cats = ['All', ...new Set(stories.map((s) => s.category).filter(Boolean))];
  const list = stories
    .map((s, i) => ({ s, i }))
    .filter(({ s }) => (cat === 'All' || s.category === cat) && (!query || s.title.toLowerCase().includes(query) || s.category.toLowerCase().includes(query)));

  return (
    <>
      <div className="fl" role="group" aria-label="Filter updates">
        {cats.map((c) => (
          <button key={c} aria-pressed={cat === c} onClick={() => setCat(c)}>
            {c}
          </button>
        ))}
        <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search updates" aria-label="Search updates" />
      </div>
      <div className="g4">
        {list.map(({ s, i }) => (
          <StoryCard key={s.id} story={s} i={i} />
        ))}
      </div>
      {list.length ? null : <p className="empty">No updates match. Try another category or search term.</p>}
    </>
  );
}
