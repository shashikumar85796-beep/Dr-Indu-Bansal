import Link from 'next/link';
import type { CSSProperties } from 'react';
import {
  Band,
  Connect,
  CoverageCard,
  Credentials,
  DemandCard,
  Hd,
  IconItem,
  Logos,
  Sec,
  Slogan,
  SocialIcon,
  StatStrip,
  StoryCard,
  socialLinks,
} from '@/components/site/blocks';
import { GalleryGrid } from '@/components/site/GalleryGrid';
import { Icon } from '@/components/site/Icon';
import { Photo, SmartImg } from '@/components/site/Photo';
import { getContent } from '@/lib/store';
import { isNumeric, videoThumb, visible, waLink } from '@/lib/utils';

const d = (s: string) => ({ '--d': s }) as CSSProperties;

const FOLLOW_TEXT: Record<string, string> = {
  Instagram: 'Event photos, press clippings and reels',
  YouTube: 'District programmes and Sangh songs',
  Facebook: 'News and announcements',
  LinkedIn: 'Professional profile',
  X: 'Latest posts',
};

export default async function Home() {
  const c = await getContent();
  const s = c.settings;
  const stories = visible(c.stories).slice(0, 4);
  const honours = visible(c.awards).filter((a) => a.kind === 'Honour').slice(0, 4);
  const videos = visible(c.videos);
  const featured = videos.find((v) => v.featured) || videos[0];
  const sideVideos = videos.filter((v) => v !== featured && v.section !== 'Songs').slice(0, 3);
  const portrait = s.aboutImage || s.heroImage;
  const stats = visible(c.homeStats);
  const numStat = stats.find((x) => isNumeric(x.value));
  const textStat = stats.find((x) => !isNumeric(x.value));
  const units = visible(c.units);
  const demands = visible(c.demands).slice(0, 3);
  const coverage = visible(c.coverage).slice(0, 3);
  const socials = socialLinks(s);
  const nameWords = (s.heroName || s.personName).trim().split(/\s+/);
  const nameLast = nameWords.pop();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: s.personName,
    alternateName: s.heroNameHindi || undefined,
    jobTitle: 'Senior journalist and documentary filmmaker',
    homeLocation: s.location,
    telephone: s.phone || undefined,
    memberOf: s.sanghName,
    sameAs: socials.map(([href]) => href),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <section className="hero3" aria-label="Introduction">
        <div className="w hero3-in">
          <div className="h3t">
            <span className="ey ld">{s.heroEyebrow}</span>
            <h1 className="hname">
              <span className="ld" style={d('.1s')}>
                {nameWords.join(' ')}
              </span>{' '}
              <span className="r ld" style={d('.22s')}>
                {nameLast}
              </span>
            </h1>
            {s.heroNameHindi ? (
              <p className="hhi ld" lang="hi" style={d('.34s')}>
                {s.heroNameHindi}
              </p>
            ) : null}
            {s.heroTitle ? (
              <p className="slogan ld" style={d('.44s')}>
                <Slogan text={s.heroTitle} redFrom={s.heroRedFrom} />
              </p>
            ) : null}
            <p className="t ld" style={d('.55s')}>
              {s.heroText}
            </p>
            <div className="bt ld" style={d('.7s')}>
              {s.heroCta1Label ? (
                <Link className="btn" href={s.heroCta1Link || '/updates'}>
                  {s.heroCta1Label}
                </Link>
              ) : null}
              {s.heroCta2Label ? (
                <Link className="btn o" href={s.heroCta2Link || '/media'}>
                  {s.heroCta2Label}
                </Link>
              ) : null}
            </div>
            <div className="h3m ld" style={d('.85s')}>
              {s.location ? <span>{s.location}</span> : null}
              {s.instagramHandle ? <span>{s.instagramHandle}</span> : null}
            </div>
          </div>
          {s.heroImage ? (
            <div className="h3v ld" style={d('.4s')}>
              <div className="arch" />
              <SmartImg src={s.heroImage} alt={s.personName} width={372} height={544} sizes="(max-width:1000px) 80vw, 460px" eager />
              {numStat ? (
                <div className="badge b1">
                  <b>
                    {numStat.value}
                    {numStat.suffix}
                  </b>
                  <span>{numStat.label}</span>
                </div>
              ) : null}
              {textStat ? (
                <div className="badge b2 t">
                  <b>{textStat.value}</b>
                  <span>{textStat.label}</span>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </section>

      <StatStrip stats={stats} />

      <Sec>
        <Hd eyebrow={s.servicesEyebrow} title={s.servicesTitle} />
        <div className="wd">
          {visible(c.services).map((w) => (
            <div className="wc" key={w.id}>
              <Icon name={w.icon} />
              <h3>{w.title}</h3>
              <p>{w.text}</p>
            </div>
          ))}
        </div>
      </Sec>

      <section className="rv alt">
        <div className="w ab">
          <div>
            <span className="ey">About Me</span>
            <h2>{s.personName}</h2>
            <p className="d">{s.aboutShort}</p>
            <Link className="btn" href="/about">
              Read My Story →
            </Link>
          </div>
          <div className="cir">
            <div className="ph">{portrait ? <SmartImg src={portrait} alt={s.personName} width={372} height={544} sizes="300px" /> : null}</div>
          </div>
          <div className="ai">
            {visible(c.highlights).map((h) => (
              <IconItem key={h.id} f={h} />
            ))}
          </div>
        </div>
      </section>

      <Sec>
        <Hd eyebrow={s.initiativesEyebrow} title={s.sanghName} link={['/sangh', 'About the Sangh']} />
        <p className="lead">{s.sanghIntro}</p>
        <Credentials s={s} />
        <div className="g4" style={{ marginTop: 28 }}>
          {visible(c.initiatives).map((x) => (
            <div className="ac" key={x.id}>
              <Icon name={x.icon} />
              <h3>{x.title}</h3>
              <p>{x.text}</p>
            </div>
          ))}
        </div>
        {demands.length || units.length ? (
          <div className="sgh">
            {demands.length ? (
              <div className="sgh-c">
                <div className="sgh-t">
                  <h3>Key demands</h3>
                  <Link className="va" href="/sangh#demands">
                    All demands →
                  </Link>
                </div>
                <div className="dms sm">
                  {demands.map((x, i) => (
                    <DemandCard key={x.id} d={x} n={i + 1} />
                  ))}
                </div>
              </div>
            ) : null}
            {units.length ? (
              <div className="sgh-c">
                <div className="sgh-t">
                  <h3>Where the Sangh is active</h3>
                  <Link className="va" href="/sangh#units">
                    See all →
                  </Link>
                </div>
                <ul className="chips">
                  {units.map((u) => (
                    <li key={u.id}>{u.name}</li>
                  ))}
                </ul>
                <Link className="btn" href="/join" style={{ marginTop: 18 }}>
                  {s.joinCta}
                </Link>
              </div>
            ) : null}
          </div>
        ) : null}
      </Sec>

      {stories.length ? (
        <Sec alt>
          <Hd eyebrow={s.updatesEyebrow} title={s.updatesTitle} link={['/updates', 'All updates']} />
          <div className="g4">
            {stories.map((st, i) => (
              <StoryCard key={st.id} story={st} i={i} />
            ))}
          </div>
        </Sec>
      ) : null}

      {honours.length ? (
        <Sec>
          <Hd eyebrow={s.honoursEyebrow} title={s.honoursTitle} link={['/awards', 'All honours']} />
          <div className="aw">
            {honours.map((a) => (
              <IconItem key={a.id} f={{ icon: a.icon, title: a.title, text: a.subtitle }} />
            ))}
          </div>
        </Sec>
      ) : null}

      {featured ? (
        <Sec alt>
          <div className="vd">
            <div>
              <span className="ey">{s.videoEyebrow}</span>
              <h2>{s.videoTitle}</h2>
              <p className="d">{s.videoText}</p>
              <Link className="btn" href="/media">
                Watch All Videos →
              </Link>
            </div>
            <a href={featured.url} target="_blank" rel="noopener" aria-label={`Watch: ${featured.title}`} style={{ display: 'block' }}>
              <Photo className="big" src={videoThumb(featured)} i={0} sizes="(max-width:900px) 100vw, 50vw">
                <div className="pl">▶</div>
                <h3 style={{ fontSize: 'clamp(20px,2.6vw,26px)', right: 20 }}>{featured.title}</h3>
              </Photo>
            </a>
            <div className="vl">
              {sideVideos.map((v, i) => (
                <a className="vi" key={v.id} href={v.url} target="_blank" rel="noopener">
                  <Photo src={videoThumb(v)} i={i + 1} sizes="92px" />
                  <p style={{ margin: 0 }}>
                    {v.title}
                    <span>{v.platform}</span>
                  </p>
                </a>
              ))}
            </div>
          </div>
        </Sec>
      ) : null}

      <Sec>
        <Hd eyebrow={s.galleryEyebrow} title={s.galleryTitle} link={['/gallery', 'View Gallery']} />
        <GalleryGrid items={visible(c.gallery).slice(0, 5)} />
      </Sec>

      {coverage.length ? (
        <Sec alt>
          <Hd eyebrow={s.pressEyebrow} title="Press coverage" link={['/press', 'All news reports']} />
          <div className="cvs">
            {coverage.map((x) => (
              <CoverageCard key={x.id} c={x} />
            ))}
          </div>
        </Sec>
      ) : null}

      {socials.length || s.whatsapp ? (
        <Sec>
          <Hd eyebrow="Social" title={s.followTitle} />
          {s.followText ? <p className="lead">{s.followText}</p> : null}
          <div className="fw">
            {socials.map(([href, label]) => (
              <a key={label} className="fwc" href={href} target="_blank" rel="noopener">
                <span className="fwi">
                  <SocialIcon name={label} />
                </span>
                <b>{label}</b>
                <span>{label === 'Instagram' && s.instagramHandle ? s.instagramHandle : FOLLOW_TEXT[label]}</span>
                <span className="fwa">Open ↗</span>
              </a>
            ))}
            {s.whatsapp ? (
              <a className="fwc" href={waLink(s.whatsapp, s.waGreeting)} target="_blank" rel="noopener">
                <span className="fwi wa">✆</span>
                <b>WhatsApp</b>
                <span>{s.phone || 'Message directly'}</span>
                <span className="fwa">Chat ↗</span>
              </a>
            ) : null}
          </div>
        </Sec>
      ) : null}

      <Band s={s} />
      <Logos s={s} items={visible(c.pressLogos)} />
      <Connect s={s} />
    </>
  );
}
