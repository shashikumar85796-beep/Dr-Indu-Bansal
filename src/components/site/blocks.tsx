import Link from 'next/link';
import type { ReactNode } from 'react';
import type { Award, Coverage, Demand, Feature, Settings, Stat, Story, TextItem, Unit, Video } from '@/lib/types';
import { isNumeric, lines, videoThumb } from '@/lib/utils';
import { Icon } from './Icon';
import { Photo } from './Photo';

export function Hd({ eyebrow, title, link }: { eyebrow: string; title: string; link?: [string, string] }) {
  return (
    <div className="hd">
      <div>
        <span className="ey">{eyebrow}</span>
        <h2>{title}</h2>
      </div>
      {link ? (
        <Link className="va" href={link[0]}>
          {link[1]} →
        </Link>
      ) : null}
    </div>
  );
}

export function Sec({ children, className = '', alt }: { children: ReactNode; className?: string; alt?: boolean }) {
  return (
    <section className={`rv ${className}${alt ? ' alt' : ''}`}>
      <div className="w">{children}</div>
    </section>
  );
}

export function PageHead({ title, sub, crumb }: { title: string; sub: string; crumb?: ReactNode }) {
  return (
    <div className="pgh">
      <div className="w">
        <div className="bc">
          <Link href="/">Home</Link> / {crumb || title}
        </div>
        <h1 className="ld">{title}</h1>
        <p className="ld" style={{ '--d': '.15s' } as React.CSSProperties}>
          {sub}
        </p>
      </div>
    </div>
  );
}

export function StatStrip({ stats }: { stats: Stat[] }) {
  if (!stats.length) return null;
  return (
    <div className="w">
      <div className="tr rv">
        {stats.map((s) => (
          <div key={s.id}>
            {isNumeric(s.value) ? (
              <b data-n={s.value} data-s={s.suffix}>
                {s.value}
                {s.suffix}
              </b>
            ) : (
              <b className="t">
                {s.value}
                {s.suffix}
              </b>
            )}
            <span>{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function StoryCard({ story, i }: { story: Story; i: number }) {
  return (
    <Link className="rc" href={`/updates/${story.slug}`}>
      <Photo src={story.image} i={i} sizes="(max-width:560px) 100vw, (max-width:1000px) 50vw, 25vw" />
      <div className="b">
        <small>{story.category}</small>
        <h3>{story.title}</h3>
        <div className="f">
          {[story.date, story.readTime].filter(Boolean).join(' · ')}
          <span className="ar">→</span>
        </div>
      </div>
    </Link>
  );
}

export function IconItem({ f }: { f: Pick<Feature, 'icon' | 'title' | 'text'> }) {
  return (
    <div>
      <Icon name={f.icon} />
      <p style={{ margin: 0 }}>
        <b>{f.title}</b>
        <span>{f.text}</span>
      </p>
    </div>
  );
}

export function AwardCard({ a }: { a: Award }) {
  return (
    <div className="ac">
      <Icon name={a.icon} />
      <h3>{a.title}</h3>
      <span>{a.subtitle}</span>
      <p>{a.description}</p>
    </div>
  );
}

export function Band({ s }: { s: Settings }) {
  return (
    <Sec className="nb">
      <div className="band">
        <div>
          <h2>{s.bandTitle}</h2>
          <p>{s.bandText}</p>
        </div>
        <Link className="btn" href="/join">
          {s.joinCta}
        </Link>
      </div>
    </Sec>
  );
}

export function Logos({ s, items }: { s: Settings; items: TextItem[] }) {
  if (!items.length) return null;
  const loop = [...items, ...items, ...items];
  return (
    <Sec>
      <span className="ey">{s.pressEyebrow}</span>
      <div className="mq" aria-label={s.pressEyebrow}>
        <div>
          {loop.map((l, i) => (
            <span key={i} aria-hidden={i >= items.length}>
              {l.text}
            </span>
          ))}
        </div>
      </div>
    </Sec>
  );
}

const SOCIAL_ICONS: Record<string, string> = {
  Facebook: 'M14 8h3V4h-3c-2.2 0-4 1.8-4 4v2H8v4h2v6h4v-6h3l1-4h-4V8z',
  X: 'M4 4l16 16M20 4L4 20',
  Instagram: 'M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4zm5 5a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm5.5-1.5h.01',
  YouTube: 'M3 8.5C3 6.6 4.6 5 6.5 5h11C19.4 5 21 6.6 21 8.5v7c0 1.9-1.6 3.5-3.5 3.5h-11C4.6 19 3 17.4 3 15.5zM10 9v6l5-3z',
  LinkedIn: 'M4 9h4v11H4zM6 4a2 2 0 1 1 0 4 2 2 0 0 1 0-4zM10 9h4v1.6c.6-1 1.8-1.8 3.5-1.8 2.8 0 3.5 1.8 3.5 4.3V20h-4v-6c0-1.3-.4-2.2-1.6-2.2-1.3 0-1.4 1-1.4 2.2v6h-4z',
};

export function SocialIcon({ name }: { name: string }) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d={SOCIAL_ICONS[name]} />
    </svg>
  );
}

export const socialLinks = (s: Settings): [string, string][] =>
  (
    [
      [s.instagram, 'Instagram'],
      [s.youtube, 'YouTube'],
      [s.facebook, 'Facebook'],
      [s.linkedin, 'LinkedIn'],
      [s.x, 'X'],
    ] as [string, string][]
  ).filter(([href]) => href);

export function Socials({ s }: { s: Settings }) {
  return (
    <div className="so">
      {socialLinks(s).map(([href, label]) => (
        <a key={label} href={href} target="_blank" rel="noopener" aria-label={label} title={label}>
          <SocialIcon name={label} />
        </a>
      ))}
    </div>
  );
}

export function Connect({ s }: { s: Settings }) {
  return (
    <div className="w">
      <div className="cn rv">
        <div className="pen" aria-hidden="true">
          ✒
        </div>
        <div className="tx">
          <h3>{s.connectTitle}</h3>
          <p>{s.connectText}</p>
        </div>
        <Link className="btn" href="/contact">
          Get in Touch →
        </Link>
        <Socials s={s} />
      </div>
    </div>
  );
}

/** Headline lines; `_word_` is underlined and lines from `redFrom` (1-based) are red. */
export function HeroTitle({ text, redFrom }: { text: string; redFrom: number }) {
  const rows = text.split('\n').map((l) => l.trim()).filter(Boolean);
  return (
    <h1>
      {rows.map((row, i) => (
        <span key={i} className={`ld${redFrom > 0 && i + 1 >= redFrom ? ' r' : ''}`} style={{ '--d': `${0.1 + i * 0.12}s`, display: 'block' } as React.CSSProperties}>
          {row.split(/(_[^_]+_)/).map((part, j) => (/^_[^_]+_$/.test(part) ? <u key={j}>{part.slice(1, -1)}</u> : part))}
        </span>
      ))}
    </h1>
  );
}

/** Slogan on one line; `_word_` is underlined and lines from `redFrom` (1-based) are red. */
export function Slogan({ text, redFrom }: { text: string; redFrom: number }) {
  const rows = text.split('\n').map((l) => l.trim()).filter(Boolean);
  return (
    <>
      {rows.map((row, i) => (
        <span key={i} className={redFrom > 0 && i + 1 >= redFrom ? 'r' : undefined}>
          {i ? ' ' : null}
          {row.split(/(_[^_]+_)/).map((part, j) => (/^_[^_]+_$/.test(part) ? <u key={j}>{part.slice(1, -1)}</u> : part))}
        </span>
      ))}
    </>
  );
}

export function CoverageCard({ c }: { c: Coverage }) {
  return (
    <a className="cv" href={c.url} target="_blank" rel="noopener">
      <span className="cv-m">
        <b>{c.outlet}</b>
        {c.date ? <span>{c.date}</span> : null}
      </span>
      <span className="cv-t">{c.title}</span>
      <span className="cv-r">Read report ↗</span>
    </a>
  );
}

export function UnitCard({ u }: { u: Unit }) {
  return (
    <div className="un">
      <div className="un-h">
        <Icon name="pin" />
        <div>
          <h3>{u.name}</h3>
          {u.president ? <span>District president: {u.president}</span> : null}
        </div>
      </div>
      {u.text ? <p>{u.text}</p> : null}
      {u.videoUrl || u.sourceUrl ? (
        <div className="un-l">
          {u.videoUrl ? (
            <a href={u.videoUrl} target="_blank" rel="noopener">
              ▶ Watch video
            </a>
          ) : null}
          {u.sourceUrl ? (
            <a href={u.sourceUrl} target="_blank" rel="noopener">
              Read report ↗
            </a>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

const statusClass = (s: string) => (/achiev/i.test(s) ? ' done' : /memorandum|progress/i.test(s) ? ' mid' : '');

export function DemandCard({ d, n }: { d: Demand; n: number }) {
  return (
    <div className="dm">
      <span className="dm-n">{String(n).padStart(2, '0')}</span>
      <div>
        <h3>{d.title}</h3>
        {d.text ? <p>{d.text}</p> : null}
      </div>
      {d.status ? <span className={`st${statusClass(d.status)}`}>{d.status}</span> : null}
    </div>
  );
}

export function Credentials({ s }: { s: Settings }) {
  const items = lines(s.credentials);
  if (!items.length) return null;
  return (
    <ul className="cred" aria-label="Registrations and certifications">
      {items.map((c) => (
        <li key={c}>
          <Icon name="shield" />
          {c}
        </li>
      ))}
    </ul>
  );
}

export function VideoCard({ v, i }: { v: Video; i: number }) {
  return (
    <a className="vc" href={v.url} target="_blank" rel="noopener" style={{ display: 'block' }}>
      <Photo src={videoThumb(v)} i={i} sizes="(max-width:560px) 100vw, (max-width:900px) 50vw, 33vw" />
      <h3>{v.title}</h3>
      <span>{v.platform} · Watch ↗</span>
    </a>
  );
}
