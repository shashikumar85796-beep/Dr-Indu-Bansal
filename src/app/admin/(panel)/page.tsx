import Link from 'next/link';
import { requireSession } from '@/lib/auth';
import { ROLE_LABEL, can, isManager, type Perm } from '@/lib/roles';
import { getContent, getSubmissions, listUploads, storageLabel } from '@/lib/store';
import type { CollectionKey } from '@/lib/types';

export const metadata = { title: 'Dashboard' };

const QUICK: [Perm, string, string, string][] = [
  ['news', '/admin/c/stories/new', 'Write an update', 'News, blog post or announcement'],
  ['media', '/admin/c/gallery', 'Add photos', 'Upload many event photos at once'],
  ['media', '/admin/c/videos/new', 'Add a video', 'Paste a YouTube or Facebook link'],
  ['news', '/admin/c/coverage/new', 'Add press coverage', 'Link a newspaper report'],
  ['achievements', '/admin/c/awards/new', 'Add an achievement', 'Award, honour or new role'],
  ['partners', '/admin/c/pressLogos/new', 'Add a partner logo', 'Partner or media outlet'],
];

const COUNTS: [Perm, CollectionKey, string, string][] = [
  ['news', 'stories', 'Updates', '/admin/c/stories'],
  ['news', 'coverage', 'Press reports', '/admin/c/coverage'],
  ['media', 'gallery', 'Photos', '/admin/c/gallery'],
  ['media', 'videos', 'Videos', '/admin/c/videos'],
  ['achievements', 'awards', 'Achievements', '/admin/c/awards'],
  ['partners', 'pressLogos', 'Partner logos', '/admin/c/pressLogos'],
];

export default async function Overview({ searchParams }: { searchParams: Promise<{ denied?: string }> }) {
  const s = await requireSession();
  const inbox = can(s, 'inbox');
  const [c, subs, uploads, sp] = await Promise.all([getContent(), inbox ? getSubmissions() : Promise.resolve([]), listUploads(), searchParams]);
  const unread = subs.filter((x) => !x.read).length;
  const missingPhotos = c.gallery.filter((g) => g.published && !g.image).length + c.stories.filter((x) => x.published && !x.image).length;
  const hour = Number(new Date().toLocaleString('en-IN', { hour: 'numeric', hour12: false, timeZone: 'Asia/Kolkata' }));
  const greet = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const quick = QUICK.filter(([p]) => can(s, p));
  const counts = COUNTS.filter(([p]) => can(s, p));

  return (
    <>
      {sp.denied ? <div className="notice">Your login doesn’t include that section. Ask the admin if you need access.</div> : null}
      <div className="a-top">
        <div>
          <h1>
            {greet}, {s.name === 'Owner' || s.name === 'Admin' ? s.username : s.name}
          </h1>
          <p>
            {ROLE_LABEL[s.role]} login. Changes go live on the website as soon as you save.
          </p>
        </div>
        <div className="acts">
          <a className="btn ghost" href="/" target="_blank" rel="noopener">
            View website ↗
          </a>
        </div>
      </div>

      {inbox && unread ? (
        <Link href="/admin/inbox" className="alert-card">
          <b>
            {unread} new enquir{unread === 1 ? 'y' : 'ies'}
          </b>
          <span>From the website’s Contact and Join forms. Open to read and reply →</span>
        </Link>
      ) : null}

      {quick.length ? (
        <>
          <h2 className="a-h">Quick actions</h2>
          <div className="quick">
            {quick.map(([, href, title, sub]) => (
              <Link key={href} href={href} className="qa">
                <b>{title}</b>
                <span>{sub}</span>
                <i aria-hidden="true">+</i>
              </Link>
            ))}
          </div>
        </>
      ) : null}

      <h2 className="a-h">On the website</h2>
      <div className="stats">
        {inbox ? (
          <Link className="stat" href="/admin/inbox">
            <b>{subs.length}</b>
            <span>Enquiries ({unread} unread)</span>
          </Link>
        ) : null}
        {counts.map(([, k, label, href]) => (
          <Link className="stat" key={k} href={href}>
            <b>{c[k].filter((x) => x.published).length}</b>
            <span>{label}</span>
          </Link>
        ))}
      </div>

      <div className="grid2">
        {inbox ? (
          <div className="card">
            <div className="a-top" style={{ marginBottom: 12 }}>
              <h2>Latest enquiries</h2>
              <Link className="va" href="/admin/inbox">
                All enquiries →
              </Link>
            </div>
            {subs.length ? (
              <div className="list">
                {subs.slice(0, 6).map((x) => (
                  <Link key={x.id} href="/admin/inbox" className="row" style={{ gridTemplateColumns: '1fr auto', textDecoration: 'none' }}>
                    <div className="tt">
                      <b style={{ display: 'block' }}>
                        {x.fields.name || 'Anonymous'} {x.read ? null : <span className="pill new">New</span>}
                      </b>
                      <small>{x.kind === 'join' ? `Membership · ${x.fields.district || ''}` : x.fields.message || x.fields.topic}</small>
                    </div>
                    <span className="muted small">{new Date(x.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="muted">No enquiries yet. Messages from the Contact and Join forms arrive here.</p>
            )}
          </div>
        ) : null}
        <div className="card">
          <h2 style={{ marginBottom: 12 }}>Good to know</h2>
          <div className="list small">
            {can(s, 'media') || can(s, 'news') ? (
              missingPhotos ? (
                <p>
                  <b>{missingPhotos}</b> updates and gallery items still show placeholder art. Add real photos in{' '}
                  <Link href="/admin/c/gallery" style={{ color: 'var(--red)' }}>
                    Media → Photos
                  </Link>
                  .
                </p>
              ) : (
                <p className="muted">Every published item has a photo.</p>
              )
            ) : null}
            <p className="muted">{uploads.length} images uploaded so far.</p>
            {isManager(s) ? (
              <>
                <p className="muted">Storage: {storageLabel()}</p>
                <p>
                  Share the work safely: give someone access to just one section in{' '}
                  <Link href="/admin/team" style={{ color: 'var(--red)' }}>
                    Team & access
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
