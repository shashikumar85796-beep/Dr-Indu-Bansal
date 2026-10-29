import Link from 'next/link';
import { requireAdmin, usernameFor } from '@/lib/auth';
import { sectionsFor } from '@/lib/roles';
import { getContent, getSubmissions, listUploads, storageLabel } from '@/lib/store';
import type { CollectionKey } from '@/lib/types';

export const metadata = { title: 'Dashboard' };

const QUICK: [string, string, string][] = [
  ['/admin/c/stories/new', 'Write an update', 'News, blog post or announcement'],
  ['/admin/c/gallery', 'Add photos', 'Upload many event photos at once'],
  ['/admin/c/videos/new', 'Add a video', 'Paste a YouTube or Facebook link'],
  ['/admin/c/coverage/new', 'Add press coverage', 'Link a newspaper report'],
  ['/admin/c/awards/new', 'Add an achievement', 'Award, honour or new role'],
  ['/admin/c/pressLogos/new', 'Add a partner logo', 'Partner or media outlet'],
];

const COUNTS: [CollectionKey, string, string][] = [
  ['stories', 'Updates', '/admin/c/stories'],
  ['coverage', 'Press reports', '/admin/c/coverage'],
  ['gallery', 'Photos', '/admin/c/gallery'],
  ['videos', 'Videos', '/admin/c/videos'],
  ['awards', 'Achievements', '/admin/c/awards'],
  ['pressLogos', 'Partner logos', '/admin/c/pressLogos'],
];

export default async function Overview({ searchParams }: { searchParams: Promise<{ denied?: string }> }) {
  const role = await requireAdmin();
  const [c, subs, uploads, username, sp] = await Promise.all([getContent(), getSubmissions(), listUploads(), usernameFor(role), searchParams]);
  const unread = subs.filter((s) => !s.read).length;
  const missingPhotos = c.gallery.filter((g) => g.published && !g.image).length + c.stories.filter((s) => s.published && !s.image).length;
  const hour = new Date().getHours();
  const greet = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <>
      {sp.denied ? <div className="notice">That section is managed by the site owner. Ask them if something there needs changing.</div> : null}
      <div className="a-top">
        <div>
          <h1>
            {greet}, {username}
          </h1>
          <p>Changes go live on the website as soon as you save.</p>
        </div>
        <div className="acts">
          <a className="btn ghost" href="/" target="_blank" rel="noopener">
            View website ↗
          </a>
        </div>
      </div>

      <h2 className="a-h">Quick actions</h2>
      <div className="quick">
        {QUICK.map(([href, title, sub]) => (
          <Link key={href} href={href} className="qa">
            <b>{title}</b>
            <span>{sub}</span>
            <i aria-hidden="true">+</i>
          </Link>
        ))}
      </div>

      <h2 className="a-h">On the website</h2>
      <div className="stats">
        <Link className="stat" href="/admin/inbox">
          <b>{unread}</b>
          <span>Unread messages</span>
        </Link>
        {COUNTS.map(([k, label, href]) => (
          <Link className="stat" key={k} href={href}>
            <b>{c[k].filter((x) => x.published).length}</b>
            <span>{label}</span>
          </Link>
        ))}
      </div>

      <div className="grid2">
        <div className="card">
          <div className="a-top" style={{ marginBottom: 12 }}>
            <h2>Latest messages</h2>
            <Link className="va" href="/admin/inbox">
              Open inbox →
            </Link>
          </div>
          {subs.length ? (
            <div className="list">
              {subs.slice(0, 6).map((s) => (
                <Link key={s.id} href="/admin/inbox" className="row" style={{ gridTemplateColumns: '1fr auto', textDecoration: 'none' }}>
                  <div className="tt">
                    <b style={{ display: 'block' }}>
                      {s.fields.name || 'Anonymous'} {s.read ? null : <span className="pill new">New</span>}
                    </b>
                    <small>{s.kind === 'join' ? `Membership · ${s.fields.district || ''}` : s.fields.message || s.fields.topic}</small>
                  </div>
                  <span className="muted small">{new Date(s.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="muted">No messages yet. Contact and membership forms on the website arrive here.</p>
          )}
        </div>
        <div className="card">
          <h2 style={{ marginBottom: 12 }}>Good to know</h2>
          <div className="list small">
            {missingPhotos ? (
              <p>
                <b>{missingPhotos}</b> updates and gallery items still show placeholder art. Add real photos in{' '}
                <Link href="/admin/c/gallery" style={{ color: 'var(--red)' }}>
                  Media → Photos
                </Link>
                .
              </p>
            ) : (
              <p className="muted">Every published item has a photo.</p>
            )}
            <p className="muted">{uploads.length} images uploaded so far.</p>
            {role === 'owner' ? (
              <>
                <p className="muted">Storage: {storageLabel()}</p>
                <p>
                  Sections you manage: {sectionsFor(role).filter((s) => s.ownerOnly).map((s) => s.label).join(', ')}, Site settings and{' '}
                  <Link href="/admin/backup" style={{ color: 'var(--red)' }}>
                    backups
                  </Link>
                  .
                </p>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
}
