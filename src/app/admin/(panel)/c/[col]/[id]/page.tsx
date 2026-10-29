import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import { canEdit } from '@/lib/roles';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ItemEditor } from '@/components/admin/Editors';
import { COLLECTIONS, blankItem, isCollection } from '@/lib/schema';
import { getContent } from '@/lib/store';
import type { AnyItem } from '@/lib/types';
import { formContext } from '../../../formctx';

type Props = { params: Promise<{ col: string; id: string }> };

export default async function EditItem({ params }: Props) {
  const { col, id } = await params;
  if (!isCollection(col)) notFound();
  if (!canEdit(await requireAdmin(), col)) redirect('/admin?denied=1');
  const def = COLLECTIONS[col];
  const [c, ctx] = await Promise.all([getContent(), formContext()]);
  const isNew = id === 'new';
  const item = isNew ? blankItem(col) : (c[col] as unknown as AnyItem[]).find((x) => x.id === id);
  if (!item) notFound();

  return (
    <>
      <div className="a-top">
        <div>
          <div className="small muted" style={{ marginBottom: 4 }}>
            <Link href={`/admin/c/${col}`}>{def.label}</Link> /
          </div>
          <h1>{isNew ? `New ${def.singular.toLowerCase()}` : String(item[def.titleKey] || def.singular)}</h1>
        </div>
      </div>
      <ItemEditor key={id} col={col} initial={item} ctx={ctx} isNew={isNew} />
    </>
  );
}
