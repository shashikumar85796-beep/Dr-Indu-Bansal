import Link from 'next/link';
import type { ReactNode } from 'react';
import type { Award, Feature, Settings, Stat, Story, TextItem } from '@/lib/types';
import { isNumeric } from '@/lib/utils';
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

export function Sec({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <section className={`rv ${className}`}>
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

export function Socials({ s }: { s: Settings }) {
  const links: [string, string, string][] = [
    [s.facebook, 'Facebook', 'f'],
    [s.x, 'X', 'X'],
    [s.instagram, 'Instagram', 'in'],
    [s.youtube, 'YouTube', '▶'],
  ];
  return (
    <div className="so">
      {links
        .filter(([href]) => href)
        .map(([href, label, glyph]) => (
          <a key={label} href={href} target="_blank" rel="noopener" aria-label={label}>
            {glyph}
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
