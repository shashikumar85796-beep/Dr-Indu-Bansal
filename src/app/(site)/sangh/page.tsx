import type { Metadata } from 'next';
import Link from 'next/link';
import { Band, Connect, Credentials, DemandCard, Hd, PageHead, Sec, UnitCard } from '@/components/site/blocks';
import { Icon } from '@/components/site/Icon';
import { SmartImg } from '@/components/site/Photo';
import { getContent } from '@/lib/store';
import { visible } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Shramjeevi Patrakar Sangh Haryana',
  description: 'District units, demands and work of Shramjeevi Patrakar Sangh Haryana, founded and led by Dr. Indu Bansal.',
};

export default async function Sangh() {
  const c = await getContent();
  const s = c.settings;
  const demands = visible(c.demands);
  const units = visible(c.units);
  const initiatives = visible(c.initiatives);
  const portrait = s.aboutImage || s.heroImage;

  return (
    <>
      <PageHead title={s.sanghName} sub={s.sanghIntro} crumb="Sangh" />

      <Sec>
        <div className="sg">
          <div>
            <span className="ey">Founder & State President</span>
            <h2>{s.personName}</h2>
            <p className="d">{s.aboutShort}</p>
            <Credentials s={s} />
            <div className="bt" style={{ marginTop: 22 }}>
              <Link className="btn" href="/join">
                {s.joinCta}
              </Link>
              <Link className="btn o" href="/about">
                About {s.personName}
              </Link>
            </div>
          </div>
          <div className="sg-side">
            {portrait ? (
              <div className="sg-p">
                <SmartImg src={portrait} alt={s.personName} width={372} height={544} sizes="240px" />
              </div>
            ) : null}
            {s.foundationDay ? (
              <div className="fd">
                <Icon name="star" />
                <div>
                  <b>Foundation Day</b>
                  <p>{s.foundationDay}</p>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </Sec>

      {demands.length ? (
        <section className="rv alt" id="demands">
          <div className="w">
            <Hd eyebrow="Our Demands" title="What the Sangh is asking for" />
            {s.demandsIntro ? <p className="lead">{s.demandsIntro}</p> : null}
            <div className="dms">
              {demands.map((d, i) => (
                <DemandCard key={d.id} d={d} n={i + 1} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {units.length ? (
        <section className="rv" id="units">
          <div className="w">
            <Hd eyebrow="District Units" title="Where the Sangh is active" />
            {s.unitsIntro ? <p className="lead">{s.unitsIntro}</p> : null}
            <div className="uns">
              {units.map((u) => (
                <UnitCard key={u.id} u={u} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {initiatives.length ? (
        <Sec alt>
          <Hd eyebrow={s.initiativesEyebrow} title={s.initiativesTitle} link={['/join', 'Join the Sangh']} />
          <div className="g4">
            {initiatives.map((x) => (
              <div className="ac" key={x.id}>
                <Icon name={x.icon} />
                <h3>{x.title}</h3>
                <p>{x.text}</p>
              </div>
            ))}
          </div>
        </Sec>
      ) : null}

      <Band s={s} />
      <Connect s={s} />
    </>
  );
}
