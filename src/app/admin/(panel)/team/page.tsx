import { TeamManager } from '@/components/admin/TeamManager';
import { listMembers, requireManager } from '@/lib/auth';
import { PERMS } from '@/lib/roles';

export const metadata = { title: 'Team & access' };

export default async function TeamPage() {
  await requireManager();
  const members = await listMembers();
  return (
    <>
      <div className="a-top">
        <div>
          <h1>Team & access</h1>
          <p>Give someone their own login for only the sections they look after, for example just News or just Photos & videos. Changes apply immediately.</p>
        </div>
      </div>
      <TeamManager members={members} perms={PERMS.map((p) => ({ id: p.id, label: p.label }))} />
    </>
  );
}
