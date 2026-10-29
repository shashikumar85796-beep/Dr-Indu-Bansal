import type { ReactNode } from 'react';
import { Sidebar } from '@/components/admin/Sidebar';
import { requireAdmin, usernameFor } from '@/lib/auth';
import { getContent, getSubmissions } from '@/lib/store';

export default async function Panel({ children }: { children: ReactNode }) {
  const role = await requireAdmin();
  const [{ settings: s }, subs, username] = await Promise.all([getContent(), getSubmissions(), usernameFor(role)]);
  return (
    <Sidebar logoFirst={s.logoFirst} logoAccent={s.logoAccent} unread={subs.filter((x) => !x.read).length} role={role} username={username}>
      {children}
    </Sidebar>
  );
}
