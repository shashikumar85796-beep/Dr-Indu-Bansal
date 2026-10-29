import type { Metadata } from 'next';
import { Connect, PageHead, Sec } from '@/components/site/blocks';
import { JoinForm } from '@/components/site/Forms';
import { getContent } from '@/lib/store';
import { lines, visible } from '@/lib/utils';

export const metadata: Metadata = { title: 'Join the Sangh' };

export default async function Join() {
  const c = await getContent();
  const s = c.settings;
  const benefits = visible(c.benefits);
  return (
    <>
      <PageHead title="Join the Sangh" sub={s.joinIntro} />
      <Sec>
        <div className="ct">
          <JoinForm districts={lines(s.districts)} roles={lines(s.joinRoles)} whatsapp={s.whatsapp} note={s.joinNote} />
          {benefits.length ? (
            <aside className="bn">
              <span className="ey">Why join</span>
              <h3>Membership benefits</h3>
              <ul>
                {benefits.map((b) => (
                  <li key={b.id}>{b.text}</li>
                ))}
              </ul>
              <p className="hn">{s.benefitsNote}</p>
            </aside>
          ) : null}
        </div>
      </Sec>
      <Connect s={s} />
    </>
  );
}
