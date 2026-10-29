import { Inbox } from '@/components/admin/Inbox';
import { getSubmissions } from '@/lib/store';

export const metadata = { title: 'Inbox' };

export default async function InboxPage() {
  const subs = await getSubmissions();
  return (
    <>
      <div className="a-top">
        <div>
          <h1>Inbox</h1>
          <p>Messages from the Contact page and membership requests from the Join page.</p>
        </div>
        <div className="acts">
          <a className="btn ghost" href="/admin/api/export?type=submissions">
            Download CSV
          </a>
        </div>
      </div>
      <Inbox subs={subs} />
    </>
  );
}
