import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import { canEdit } from '@/lib/roles';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BulkPhotos } from '@/components/admin/BulkPhotos';
import { CollectionList } from '@/components/admin/CollectionList';
import { lines } from '@/lib/utils';
import { COLLECTIONS, isCollection } from '@/lib/schema';
import { getContent } from '@/lib/store';
import type { AnyItem } from '@/lib/types';

type Props = { params: Promise<{ col: string }> };

export default async function CollectionPage({ params }: Props) {
  const { col } = await params;
  if (!isCollection(col)) notFound();
  if (!canEdit(await requireAdmin(), col)) redirect('/admin?denied=1');
  const def = COLLECTIONS[col];
  const content = await getContent();
  const items = content[col] as unknown as AnyItem[];
  const rows = items.map((it) => ({
    id: it.id,
    published: it.published,
    title: String(it[def.titleKey] || '').slice(0, 160) || `Untitled ${def.singular.toLowerCase()}`,
    sub: def.subKeys.map((k) => String(it[k] ?? '')).filter(Boolean).join(' · ').slice(0, 160),
    image: def.imageKey ? String(it[def.imageKey] || '') : '',
    icon: def.iconKey ? String(it[def.iconKey] || '') : '',
    href: col === 'stories' ? `/updates/${it.slug}` : '',
  }));

  return (
    <>
      <div className="a-top">
        <div>
          <h1>{def.label}</h1>
          <p>{def.description} Drag rows (or use the arrows) to change the order on the website.</p>
        </div>
        <div className="acts">
          <Link className="btn" href={`/admin/c/${col}/new`}>
            + New {def.singular.toLowerCase()}
          </Link>
        </div>
      </div>
      {col === 'gallery' ? <BulkPhotos categories={lines(content.settings.galleryCategories)} /> : null}
      <CollectionList col={col} rows={rows} singular={def.singular} />
    </>
  );
}
