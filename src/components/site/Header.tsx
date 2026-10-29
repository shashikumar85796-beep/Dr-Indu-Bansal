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
          <button className="bg th" onClick={toggleTheme} aria-label="Toggle dark mode" title="Dark / light">
            ◐
          </button>
          <button className="bg" onClick={() => setOpen((o) => !o)} aria-label="Menu" aria-expanded={open}>
            ☰
          </button>
        </div>
      </header>
    </>
  );
}
