'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import { logoutAction } from '@/app/admin/actions';
import { ROLE_LABEL, isTabActive, sectionOf, sectionsFor, type Role } from '@/lib/roles';

const ICON: Record<string, string> = {
  home: '<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
  chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  inbox: '<path d="M3 13h5l1 3h6l1-3h5M5 5h14l2 8v6H3v-6z"/>',
  news: '<path d="M4 5h13v14H6a2 2 0 0 1-2-2zM17 9h3v8a2 2 0 0 1-2 2M7 9h7M7 13h7M7 16h4"/>',
  image: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5-9 9"/>',
  cup: '<path d="M8 4h8v6a4 4 0 0 1-8 0zM8 6H4v1a4 4 0 0 0 4 4M16 6h4v1a4 4 0 0 1-4 4M12 14v4M8 21h8"/>',
  handshake: '<path d="M8 12l3 3a2 2 0 0 0 3 0l5-5M3 9l4-4 5 3 5-3 4 4-4 5M7 15l-2 2M10 17l-1 1"/>',
  us: '<circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.4"/><path d="M3 20c0-4 3-6 6-6s6 2 6 6M15 14c3 0 6 1.5 6 5"/>',
  layers: '<path d="M12 3l9 5-9 5-9-5zM3 13l9 5 9-5"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1"/>',
  backup: '<path d="M12 3v12M7 10l5 5 5-5M4 19h16"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-7 8-7s8 3 8 7"/>',
  out: '<path d="M14 4h5v16h-5M10 8l-4 4 4 4M6 12h10"/>',
  open: '<path d="M14 4h6v6M20 4l-9 9M18 14v6H4V6h6"/>',
};

const Ico = ({ name }: { name: string }) => <svg viewBox="0 0 24 24" aria-hidden="true" dangerouslySetInnerHTML={{ __html: ICON[name] || ICON.layers }} />;

export function Sidebar({
  logoFirst,
  logoAccent,
  unread,
  role,
  username,
  children,
}: {
  logoFirst: string;
  logoAccent: string;
  unread: number;
  role: Role;
  username: string;
  children: ReactNode;
}) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [path]);
  const current = sectionOf(path);

  const L = ({ href, label, icon, badge, on }: { href: string; label: string; icon: string; badge?: number; on?: boolean }) => {
    const active = on ?? (href === '/admin' ? path === href : isTabActive(path, href));
    return (
      <Link href={href} className={`a-link${active ? ' on' : ''}`} aria-current={active ? 'page' : undefined}>
        <span className="a-ico">
          <Ico name={icon} />
        </span>
        <span className="a-lbl">{label}</span>
        {badge ? <span className="a-badge">{badge}</span> : null}
      </Link>
    );
  };

  return (
    <>
      <div className="a-mbar">
        <b className="a-mlogo">
          {logoFirst} <i>{logoAccent}</i>
        </b>
        <button onClick={() => setOpen(true)} aria-label="Open menu" aria-expanded={open}>
          ☰
        </button>
      </div>
      {open ? <div className="a-scrim" onClick={() => setOpen(false)} /> : null}
      <div className="a-shell">
        <aside className={`a-side${open ? ' open' : ''}`} aria-label="Dashboard">
          <Link href="/admin" className="a-brand">
            {logoFirst} <i>{logoAccent}</i>
            <small>Website dashboard</small>
          </Link>
          <div className="a-user">
            <span className="a-av">{username.slice(0, 1).toUpperCase()}</span>
            <span>
              <b>{username}</b>
              <span className={`a-role ${role}`}>{ROLE_LABEL[role]}</span>
            </span>
          </div>

          <L href="/admin" label="Dashboard" icon="home" />
          <L href="/admin/analytics" label="Analytics" icon="chart" />
          <L href="/admin/inbox" label="Inbox" icon="inbox" badge={unread} />

          <div className="a-grp">Content</div>
          {sectionsFor(role)
            .filter((s) => !s.ownerOnly)
            .map((s) => (
              <L key={s.id} href={s.tabs[0].href} label={s.label} icon={s.icon} on={current?.id === s.id} />
            ))}

          {role === 'owner' ? (
            <>
              <div className="a-grp">Site · owner only</div>
              {sectionsFor(role)
                .filter((s) => s.ownerOnly)
                .map((s) => (
                  <L key={s.id} href={s.tabs[0].href} label={s.label} icon={s.icon} on={current?.id === s.id} />
                ))}
              <L href="/admin/settings" label="Site settings" icon="settings" />
              <L href="/admin/backup" label="Backup & restore" icon="backup" />
            </>
          ) : null}

          <div className="a-grp">Account</div>
          <L href="/admin/account" label="My account" icon="user" />
          <div className="grow" />
          <a className="a-link" href="/" target="_blank" rel="noopener">
            <span className="a-ico">
              <Ico name="open" />
            </span>
            <span className="a-lbl">View website</span>
          </a>
          <form action={logoutAction}>
            <button className="a-link a-out">
              <span className="a-ico">
                <Ico name="out" />
              </span>
              <span className="a-lbl">Sign out</span>
            </button>
          </form>
        </aside>
        <main className="a-main">
          {current && current.tabs.length > 1 ? (
            <nav className="a-tabs" aria-label={`${current.label} sections`}>
              <span className="a-tabs-t">{current.label}</span>
              <div>
                {current.tabs.map((t) => {
                  const on = isTabActive(path, t.href);
                  return (
                    <Link key={t.href} href={t.href} className={on ? 'on' : ''} aria-current={on ? 'page' : undefined}>
                      {t.label}
                    </Link>
                  );
                })}
              </div>
            </nav>
          ) : null}
          {children}
        </main>
      </div>
    </>
  );
}
