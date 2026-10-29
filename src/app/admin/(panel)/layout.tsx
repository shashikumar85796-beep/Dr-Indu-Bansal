import type { ReactNode } from 'react';
import { Sidebar } from '@/components/admin/Sidebar';
import { requireSession } from '@/lib/auth';
import { can } from '@/lib/roles';
import { getContent, getSubmissions } from '@/lib/store';

export default async function Panel({ children }: { children: ReactNode }) {
  const session = await requireSession();
  const [{ settings: s }, subs] = await Promise.all([getContent(), can(session, 'inbox') ? getSubmissions() : Promise.resolve([])]);
  return (
    <Sidebar logoFirst={s.logoFirst} logoAccent={s.logoAccent} unread={subs.filter((x) => !x.read).length} session={session}>
      {children}
    </Sidebar>
  );
}
