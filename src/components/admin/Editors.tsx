'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { deleteItem, saveItem, saveSettings } from '@/app/admin/actions';
import { COLLECTIONS, SETTINGS_GROUPS } from '@/lib/schema';
import type { CollectionKey } from '@/lib/types';
import { ItemForm, type FormCtx } from './ItemForm';

export function SettingsEditor({ initial, ctx }: { initial: Record<string, unknown>; ctx: FormCtx }) {
  return (
    <>
      <nav className="toc" aria-label="Settings sections">
        {SETTINGS_GROUPS.map((g) => (
          <a key={g.id} href={`#${g.id}`}>
            {g.title}
          </a>
        ))}
      </nav>
      <ItemForm groups={SETTINGS_GROUPS} initial={initial} ctx={ctx} onSave={saveSettings} saveLabel="Save settings" />
    </>
  );
}

export function ItemEditor({ col, initial, ctx, isNew }: { col: CollectionKey; initial: Record<string, unknown>; ctx: FormCtx; isNew: boolean }) {
  const router = useRouter();
  const def = COLLECTIONS[col];
  const viewHref = col === 'stories' && !isNew && initial.published ? `/updates/${initial.slug}` : null;

  return (
    <ItemForm
      groups={[{ id: 'item', title: '', fields: def.fields }]}
      initial={initial}
      ctx={ctx}
      saveLabel={isNew ? `Publish ${def.singular.toLowerCase()}` : 'Save changes'}
      onSave={async (v) => {
        const r = await saveItem(col, { ...v, id: initial.id });
        if (r.ok && isNew) {
          router.replace(`/admin/c/${col}/${r.id}`);
          return { ok: true, message: 'Created.' };
        }
        if (r.ok) router.refresh();
        return r;
      }}
      extraActions={
        <>
          {viewHref ? (
            <a className="btn ghost" href={viewHref} target="_blank" rel="noopener">
              View ↗
            </a>
          ) : null}
          {!isNew ? (
            <button
              type="button"
              className="btn danger"
              onClick={async () => {
                if (!confirm(`Delete this ${def.singular.toLowerCase()}? This cannot be undone.`)) return;
                const r = await deleteItem(col, String(initial.id));
                if (r.ok) router.push(`/admin/c/${col}`);
                else alert(r.error);
              }}
            >
              Delete
            </button>
          ) : null}
          <Link className="btn ghost" href={`/admin/c/${col}`}>
            Back to list
          </Link>
        </>
      }
    />
  );
}
