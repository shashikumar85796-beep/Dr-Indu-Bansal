import Link from 'next/link';
import type { ReactNode } from 'react';
import type { Award, Coverage, Demand, Feature, Settings, Stat, Story, TextItem, Unit, Video } from '@/lib/types';
import { isNumeric, lines, videoThumb, waLink } from '@/lib/utils';
import { BrandIcon, brandColor } from './BrandIcon';
import { Icon } from './Icon';
import { Photo, SmartImg } from './Photo';

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
          {loop.map((l, i) => {
            const inner = l.image ? <SmartImg src={l.image} alt={l.text} width={160} height={48} sizes="160px" className="mq-logo" /> : l.text;
            const hidden = i >= items.length;
            return l.url ? (
              <a key={i} href={l.url} target="_blank" rel="noopener" aria-hidden={hidden} tabIndex={hidden ? -1 : undefined} title={l.text}>
                <span>{inner}</span>
              </a>
            ) : (
              <span key={i} aria-hidden={hidden} title={l.text}>
                {inner}
              </span>
            );
          })}
        </div>
      </div>
    </Sec>
  );
}

/** Official brand mark for a social network. */
export function SocialIcon({ name, size = 18 }: { name: string; size?: number }) {
  return <BrandIcon name={name} size={size} />;
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

/** Round buttons in each network's own colour, with its official mark. */
export function Socials({ s, size = 18, withWhatsApp }: { s: Settings; size?: number; withWhatsApp?: boolean }) {
  const links = socialLinks(s);
  if (withWhatsApp && s.whatsapp) links.push([waLink(s.whatsapp, s.waGreeting), 'WhatsApp']);
  return (
    <div className="so">
      {links.map(([href, label]) => (
        <a key={label} href={href} target="_blank" rel="noopener" aria-label={label} title={label} style={{ '--brand': brandColor(label) } as React.CSSProperties}>
          <SocialIcon name={label} size={size} />
        </a>
      ))}
    </div>
  );
}

export function Connect({ s }: { s: Settings }) {
  return (
    <div className="w">
      <div className="cn rv">
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
