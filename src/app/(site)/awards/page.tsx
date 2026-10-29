import type { Metadata } from 'next';
import { pageMeta } from '@/lib/seo';
import { AwardCard, Connect, Hd, Logos, PageHead, Sec } from '@/components/site/blocks';
import { getContent } from '@/lib/store';
import { visible } from '@/lib/utils';

export const metadata: Metadata = pageMeta({
  title: 'Awards',
  share: 'Awards & honours',
  description: 'Awards, honours and roles of Dr. Indu Bansal, including Best Journalist awards from the Governor and Chief Minister of Haryana.',
  path: '/awards',
});

export default async function Awards() {
  const c = await getContent();
  const all = visible(c.awards);
  const honours = all.filter((a) => a.kind === 'Honour');
  const roles = all.filter((a) => a.kind === 'Role');
  return (
    <>
      <PageHead title="Awards" sub={c.settings.awardsIntro} />
      {honours.length ? (
        <Sec>
          <Hd eyebrow={c.settings.honoursEyebrow} title="Awards & Recognition" />
          <div className="al">
            {honours.map((a) => (
              <AwardCard key={a.id} a={a} />
            ))}
          </div>
        </Sec>
      ) : null}
      {roles.length ? (
        <Sec alt>
          <Hd eyebrow="Roles" title="Leadership & Responsibilities" />
          <div className="al">
            {roles.map((a) => (
              <AwardCard key={a.id} a={a} />
            ))}
          </div>
        </Sec>
      ) : null}
      <Logos s={c.settings} items={visible(c.pressLogos)} />
      <Connect s={c.settings} />
    </>
  );
}
