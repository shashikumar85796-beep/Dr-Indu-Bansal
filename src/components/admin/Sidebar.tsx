'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import { logoutAction } from '@/app/admin/actions';

type Group = { title: string; links: { href: string; label: string }[] };

export function Sidebar({ logoFirst, logoAccent, unread, groups, children }: { logoFirst: string; logoAccent: string; unread: number; groups: Group[]; children: ReactNode }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [path]);

  const L = ({ href, label, badge }: { href: string; label: string; badge?: number }) => {
    const on = href === '/admin' ? path === href : path === href || path.startsWith(href + '/');
    return (
      <Link href={href} className={`a-link${on ? ' on' : ''}`} aria-current={on ? 'page' : undefined}>
        {label}
        {badge ? <span className="a-badge">{badge}</span> : null}
      </Link>
    );
  };

  return (
    <>
      <div className="a-mbar">
        <b style={{ font: '800 16px var(--fh)' }}>
          {logoFirst} <i style={{ fontStyle: 'normal', color: 'var(--red)' }}>{logoAccent}</i>
        </b>
        <button onClick={() => setOpen(true)} aria-label="Open menu" aria-expanded={open}>
          ☰
        </button>
      </div>
      {open ? <div className="a-scrim" onClick={() => setOpen(false)} /> : null}
      <div className="a-shell">
        <aside className={`a-side${open ? ' open' : ''}`} aria-label="Dashboard">
          <Link href="/admin" className="a-brand" style={{ textDecoration: 'none' }}>
            {logoFirst} <i>{logoAccent}</i>
            <small>Website dashboard</small>
          </Link>
          <L href="/admin" label="Overview" />
          <L href="/admin/inbox" label="Inbox" badge={unread} />
          <L href="/admin/settings" label="Site settings" />
          {groups.map((g) => (
            <div key={g.title} style={{ display: 'contents' }}>
              <div className="a-grp">{g.title}</div>
              {g.links.map((l) => (
                <L key={l.href} {...l} />
              ))}
            </div>
          ))}
          <div className="a-grp">Tools</div>
          <L href="/admin/media" label="Media library" />
          <L href="/admin/backup" label="Backup & restore" />
          <L href="/admin/account" label="Account" />
          <div className="grow" />
          <a className="a-link" href="/" target="_blank" rel="noopener">
            View website ↗
          </a>
          <form action={logoutAction}>
            <button className="a-link" style={{ width: '100%', border: 0, background: 'none', cursor: 'pointer', font: 'inherit', color: 'inherit' }}>
              Sign out
            </button>
          </form>
        </aside>
        <main className="a-main">{children}</main>
      </div>
    </>
  );
}
