import Link from 'next/link';
import { Inbox } from '@/components/admin/Inbox';
import { requirePerm } from '@/lib/auth';
import { getSubmissions } from '@/lib/store';

export const metadata = { title: 'Enquiries' };

const TABS: [string, string][] = [
  ['all', 'All enquiries'],
  ['contact', 'Contact messages'],
  ['join', 'Membership requests'],
];

export default async function InboxPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  await requirePerm('inbox');
  const [subs, sp] = await Promise.all([getSubmissions(), searchParams]);
  const type = sp.type === 'contact' || sp.type === 'join' ? sp.type : 'all';
  const count = (t: string) => subs.filter((s) => (t === 'all' || s.kind === t) && !s.read).length;
  return (
    <>
      <nav className="a-tabs" aria-label="Enquiry types">
        <span className="a-tabs-t">Enquiries</span>
        <div>
          {TABS.map(([t, label]) => (
            <Link key={t} href={t === 'all' ? '/admin/inbox' : `/admin/inbox?type=${t}`} className={type === t ? 'on' : ''} aria-current={type === t ? 'page' : undefined}>
              {label}
              {count(t) ? <span className="tab-n">{count(t)}</span> : null}
            </Link>
          ))}
        </div>
      </nav>
      <div className="a-top">
        <div>
          <h1>Enquiries</h1>
          <p>Every message sent from the website’s Contact form and Join form arrives here, even when the visitor also opened WhatsApp.</p>
        </div>
        <div className="acts">
          <a className="btn ghost" href="/admin/api/export?type=submissions">
            Download CSV
          </a>
        </div>
      </div>
      <Inbox key={type} subs={type === 'all' ? subs : subs.filter((s) => s.kind === type)} />
    </>
  );
}
