import type { ReactNode } from 'react';
import { Sidebar } from '@/components/admin/Sidebar';
import { requireAdmin } from '@/lib/auth';
import { COLLECTIONS, COLLECTION_KEYS } from '@/lib/schema';
import { getContent, getSubmissions } from '@/lib/store';

export default async function Panel({ children }: { children: ReactNode }) {
  await requireAdmin();
  const [{ settings: s }, subs] = await Promise.all([getContent(), getSubmissions()]);
  const groups = (['Content', 'Sangh', 'Page sections'] as const).map((g) => ({
    title: g,
    links: COLLECTION_KEYS.filter((k) => COLLECTIONS[k].group === g).map((k) => ({ href: `/admin/c/${k}`, label: COLLECTIONS[k].label })),
  }));
  return (
    <Sidebar logoFirst={s.logoFirst} logoAccent={s.logoAccent} unread={subs.filter((x) => !x.read).length} groups={groups}>
      {children}
    </Sidebar>
  );
}
