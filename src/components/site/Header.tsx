'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { NAV } from '@/lib/nav';

export function Header({ logoFirst, logoAccent, tagline, joinCta }: { logoFirst: string; logoAccent: string; tagline: string; joinCta: string }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const hd = useRef<HTMLElement>(null);
  const pg = useRef<HTMLDivElement>(null);

  useEffect(() => setOpen(false), [path]);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const d = document.documentElement;
        const max = d.scrollHeight - innerHeight || 1;
        if (pg.current) pg.current.style.transform = `scaleX(${Math.min(1, scrollY / max)})`;
        hd.current?.classList.toggle('s', scrollY > 10);
      });
    };
    onScroll();
    addEventListener('scroll', onScroll, { passive: true });
    return () => removeEventListener('scroll', onScroll);
  }, [path]);

  const active = (href: string) => (href === '/' ? path === '/' : path === href || path.startsWith(href + '/'));

  const toggleTheme = () => {
    const rt = document.documentElement;
    const dark = rt.dataset.theme ? rt.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme:dark)').matches;
    const t = dark ? 'light' : 'dark';
    rt.dataset.theme = t;
    try {
      localStorage.setItem('theme', t);
    } catch {}
  };

  return (
    <>
      <div id="pg" ref={pg} />
      <header id="hd" ref={hd}>
        <div className="w nv">
          <Link className="lg" href="/">
            <b>
              {logoFirst} <i>{logoAccent}</i>
            </b>
            <small>{tagline}</small>
          </Link>
          <nav className={`mn${open ? ' open' : ''}`} id="mn" aria-label="Main">
            {NAV.map(([href, label]) => (
              <Link key={href} href={href} className={active(href) ? 'on' : ''} aria-current={active(href) ? 'page' : undefined}>
                {label}
              </Link>
            ))}
            <Link className="jm" href="/join">
              {joinCta}
            </Link>
          </nav>
          <Link className="btn" href="/join">
            {joinCta}
          </Link>
          <button className="bg th" onClick={toggleTheme} aria-label="Switch light or dark mode" title="Light / dark">
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
            </svg>
          </button>
          <button className="bg mb" onClick={() => setOpen((o) => !o)} aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open}>
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </header>
    </>
  );
}
