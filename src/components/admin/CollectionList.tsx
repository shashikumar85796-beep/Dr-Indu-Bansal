'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';
import { deleteItem, duplicateItem, moveItem, reorderItems, togglePublished } from '@/app/admin/actions';
import { ICONS } from '@/lib/icons';
import { useToast } from './useToast';

type Row = { id: string; published: boolean; title: string; sub: string; image: string; icon: string; href: string };

export function CollectionList({ col, rows: initial, singular }: { col: string; rows: Row[]; singular: string }) {
  const router = useRouter();
  const [rows, setRows] = useState(initial);
  const [q, setQ] = useState('');
  const [show, setShow] = useState<'all' | 'on' | 'off'>('all');
  const [dragId, setDragId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const [toast, toastNode] = useToast();

  useEffect(() => setRows(initial), [initial]);

  const run = (fn: () => Promise<{ ok: boolean; error?: string }>, done?: string) =>
    start(async () => {
      const r = await fn();
      if (!r.ok) toast(r.error || 'Something went wrong.', true);
      else if (done) toast(done);
      router.refresh();
    });

  const query = q.trim().toLowerCase();
  const filtering = !!query || show !== 'all';
  const shown = rows.filter((r) => (show === 'all' || (show === 'on') === r.published) && (!query || `${r.title} ${r.sub}`.toLowerCase().includes(query)));

  const drop = (targetId: string) => {
    if (!dragId || dragId === targetId) return;
    const next = [...rows];
    const from = next.findIndex((r) => r.id === dragId);
    const to = next.findIndex((r) => r.id === targetId);
    next.splice(to, 0, next.splice(from, 1)[0]);
    setRows(next);
    run(() => reorderItems(col, next.map((r) => r.id)), 'Order saved.');
  };

  return (
    <>
      <div className="tools">
        <input type="search" placeholder={`Search ${rows.length} items`} value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search" />
        <select value={show} onChange={(e) => setShow(e.target.value as typeof show)} aria-label="Filter">
          <option value="all">All</option>
          <option value="on">Shown on website</option>
          <option value="off">Hidden</option>
        </select>
        {pending ? <span className="muted small">Saving…</span> : null}
      </div>
      {shown.length ? (
        <div className="list">
          {shown.map((r, i) => (
            <div
              key={r.id}
              className={`row${r.published ? '' : ' off'}${dragId === r.id ? ' drag' : ''}${overId === r.id && dragId !== r.id ? ' over' : ''}`}
              draggable={!filtering}
              onDragStart={() => setDragId(r.id)}
              onDragEnd={() => {
                setDragId(null);
                setOverId(null);
              }}
              onDragOver={(e) => {
                if (!dragId) return;
                e.preventDefault();
                setOverId(r.id);
              }}
              onDrop={(e) => {
                e.preventDefault();
                drop(r.id);
              }}
            >
              <span className="grip" aria-hidden="true" title={filtering ? 'Clear search to reorder' : 'Drag to reorder'}>
                ⋮⋮
              </span>
              <div className="th">
                {r.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={r.image} alt="" loading="lazy" />
                ) : r.icon ? (
                  <svg viewBox="0 0 24 24" aria-hidden="true" dangerouslySetInnerHTML={{ __html: ICONS[r.icon] || ICONS.star }} />
                ) : (
                  <span className="small muted">{rows.indexOf(r) + 1}</span>
                )}
              </div>
              <div className="tt">
                <Link href={`/admin/c/${col}/${r.id}`}>{r.title}</Link>
                <small>{r.sub || ' '}</small>
              </div>
              <div className="ra">
                <button
                  className={`pill${r.published ? ' on' : ''}`}
                  style={{ border: 0, cursor: 'pointer', marginRight: 4 }}
                  onClick={() => run(() => togglePublished(col, r.id))}
                  title="Show or hide on the website"
                >
                  {r.published ? '● Live' : '○ Hidden'}
                </button>
                <button className="ib" disabled={filtering || i === 0} onClick={() => run(() => moveItem(col, r.id, -1))} aria-label="Move up" title="Move up">
                  ↑
                </button>
                <button className="ib" disabled={filtering || i === shown.length - 1} onClick={() => run(() => moveItem(col, r.id, 1))} aria-label="Move down" title="Move down">
                  ↓
                </button>
                <Link className="ib" href={`/admin/c/${col}/${r.id}`} aria-label="Edit" title="Edit">
                  ✎
                </Link>
                <button className="ib" onClick={() => run(() => duplicateItem(col, r.id), 'Copy created (hidden).')} aria-label="Duplicate" title="Duplicate">
                  ⧉
                </button>
                {r.href && r.published ? (
                  <a className="ib" href={r.href} target="_blank" rel="noopener" aria-label="View on site" title="View on site">
                    ↗
                  </a>
                ) : null}
                <button
                  className="ib del"
                  onClick={() => {
                    if (confirm(`Delete “${r.title}”? This cannot be undone.`)) run(() => deleteItem(col, r.id), `${singular} deleted.`);
                  }}
                  aria-label="Delete"
                  title="Delete"
                >
                  🗑
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card muted">{rows.length ? 'Nothing matches your search.' : `No items yet. Add your first ${singular.toLowerCase()}.`}</div>
      )}
      {toastNode}
    </>
  );
}
