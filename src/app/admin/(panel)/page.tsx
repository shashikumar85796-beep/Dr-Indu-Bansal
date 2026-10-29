import Link from 'next/link';
import { COLLECTIONS, COLLECTION_KEYS } from '@/lib/schema';
import { getContent, getSubmissions, listUploads, storageLabel } from '@/lib/store';

export const metadata = { title: 'Overview' };

export default async function Overview() {
  const [c, subs, uploads] = await Promise.all([getContent(), getSubmissions(), listUploads()]);
  const unread = subs.filter((s) => !s.read).length;
  const missingPhotos = c.gallery.filter((g) => g.published && !g.image).length + c.stories.filter((s) => s.published && !s.image).length;

  return (
    <>
      <div className="a-top">
        <div>
          <h1>Welcome back</h1>
          <p>Everything on the website comes from here. Changes go live as soon as you save.</p>
        </div>
        <div className="acts">
          <Link className="btn" href="/admin/c/stories/new">
            + New update
          </Link>
          <Link className="btn ghost" href="/admin/c/gallery/new">
            + Add photo
          </Link>
          <a className="btn ghost" href="/" target="_blank" rel="noopener">
            View site ↗
          </a>
        </div>
      </div>

      <div className="stats">
        <Link className="stat" href="/admin/inbox">
          <b>{unread}</b>
          <span>Unread messages</span>
        </Link>
        {COLLECTION_KEYS.filter((k) => COLLECTIONS[k].group === 'Content').map((k) => (
          <Link className="stat" key={k} href={`/admin/c/${k}`}>
            <b>{c[k].length}</b>
            <span>{COLLECTIONS[k].label}</span>
          </Link>
        ))}
        <Link className="stat" href="/admin/media">
          <b>{uploads.length}</b>
          <span>Uploaded images</span>
        </Link>
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
          <h2 style={{ marginBottom: 12 }}>To do</h2>
          <div className="list small">
            {missingPhotos ? (
              <p>
                <b>{missingPhotos}</b> updates and gallery items still show placeholder art. Add real photos in{' '}
                <Link href="/admin/c/gallery" style={{ color: 'var(--red)' }}>
                  Photo gallery
                </Link>{' '}
                and{' '}
                <Link href="/admin/c/stories" style={{ color: 'var(--red)' }}>
                  Updates
                </Link>
                .
              </p>
            ) : (
              <p className="muted">Every published item has a photo.</p>
            )}
            {!c.settings.facebook || !c.settings.youtube ? (
              <p>
                Add your Facebook and YouTube links in{' '}
                <Link href="/admin/settings#contact" style={{ color: 'var(--red)' }}>
                  Contact & social
                </Link>{' '}
                so they show in the footer.
              </p>
            ) : null}
            <p className="muted">Storage: {storageLabel()}</p>
            <p>
              Download a{' '}
              <Link href="/admin/backup" style={{ color: 'var(--red)' }}>
                backup
              </Link>{' '}
              now and then.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
