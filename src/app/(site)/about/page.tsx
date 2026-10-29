import type { Metadata } from 'next';
import Link from 'next/link';
import { Band, Connect, Hd, PageHead, Sec, StatStrip } from '@/components/site/blocks';
import { SmartImg } from '@/components/site/Photo';
import { getContent } from '@/lib/store';
import { paragraphs, visible } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'About',
  description: 'Biography of Dr. Indu Bansal, journalist and documentary filmmaker from Sonipat, Haryana, founder of Shramjeevi Patrakar Sangh Haryana.',
  alternates: { canonical: '/about' },
};

export default async function About() {
  const c = await getContent();
  const s = c.settings;
  const portrait = s.aboutImage || s.heroImage;
  return (
    <>
      <PageHead title="About" sub={s.aboutIntro} />
      <Sec>
        <div className="ab2">
          <div className="cir" style={{ maxWidth: 340 }}>
            <div className="ph">{portrait ? <SmartImg src={portrait} alt={s.personName} width={372} height={544} sizes="340px" eager /> : null}</div>
          </div>
          <div>
            <span className="ey">Biography</span>
            <h2>{s.personName}</h2>
            {paragraphs(s.aboutBio).map((p, i) => (
              <p key={i}>{p}</p>
            ))}
            <div className="bt" style={{ marginTop: 22 }}>
              <Link className="btn" href="/contact">
                Get in touch →
              </Link>
              <Link className="btn o" href="/awards">
                See honours
              </Link>
            </div>
          </div>
        </div>
      </Sec>
      <StatStrip stats={visible(c.aboutStats)} />
      {visible(c.milestones).length ? (
        <Sec alt>
          <Hd eyebrow={s.milestonesEyebrow} title={s.milestonesTitle} />
          <ul className="vt">
            {visible(c.milestones).map((m) => (
              <li key={m.id}>
                <b>{m.year}</b>
                <h3>{m.title}</h3>
                <p>{m.text}</p>
              </li>
            ))}
          </ul>
        </Sec>
      ) : null}
      <Band s={s} />
      <Connect s={s} />
    </>
  );
}
