'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { deleteItem, saveItem, saveSettings } from '@/app/admin/actions';
import { COLLECTIONS, SETTINGS_GROUPS } from '@/lib/schema';
import type { CollectionKey } from '@/lib/types';
import { slugify } from '@/lib/utils';
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
  const main = def.fields.filter((f) => f.section !== 'seo');
  const seo = def.fields.filter((f) => f.section === 'seo');
  const groups = [{ id: 'item', title: '', fields: main }, ...(seo.length ? [{ id: 'seo', title: 'Search engine (SEO)', fields: seo }] : [])];

  return (
    <ItemForm
      groups={groups}
      asideAfter="seo"
      aside={col === 'stories' ? (v) => <SeoPreview v={v} siteUrl={ctx.siteUrl || ''} /> : undefined}
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

const firstParagraph = (body: unknown) => String(body || '').split(/\n\s*\n/)[0]?.trim() || '';
const clip = (s: string, n: number) => (s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s);

/** Live preview of how an update appears in Google results, with quick checks. */
function SeoPreview({ v, siteUrl }: { v: Record<string, unknown>; siteUrl: string }) {
  const title = String(v.seoTitle || v.title || 'Your headline');
  const desc = String(v.seoDescription || firstParagraph(v.body) || 'The first paragraph of the story is used here.');
  const slug = slugify(String(v.slug || v.title || 'update'));
  const host = (siteUrl || 'https://your-site').replace(/^https?:\/\//, '').replace(/\/$/, '');
  const checks: [boolean, string][] = [
    [title.length >= 25 && title.length <= 60, 'Title between 25 and 60 characters'],
    [desc.length >= 70 && desc.length <= 160, 'Description between 70 and 160 characters'],
    [Boolean(v.image || v.ogImage), 'Has a cover or share image'],
    [Boolean(String(v.keywords || '').trim()), 'Keywords added'],
    [slug.length <= 60 && !/^update(-\d+)?$/.test(slug), 'Short, readable web address'],
  ];
  return (
    <div className="serp-wrap">
      <span className="lbl">Google preview</span>
      <div className="serp">
        <span className="serp-u">
          {host} › updates › {slug}
        </span>
        <span className="serp-t">{clip(title, 60)}</span>
        <span className="serp-d">{clip(desc, 160)}</span>
      </div>
      <ul className="seo-checks">
        {checks.map(([ok, label]) => (
          <li key={label} className={ok ? 'ok' : ''}>
            <span aria-hidden="true">{ok ? '✓' : '!'}</span> {label}
          </li>
        ))}
      </ul>
    </div>
  );
}
