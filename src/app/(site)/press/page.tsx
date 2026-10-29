import type { Metadata } from 'next';
import { Connect, CoverageCard, Logos, PageHead, Sec } from '@/components/site/blocks';
import { getContent } from '@/lib/store';
import { visible } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'In the News',
  description: 'News reports about Dr. Indu Bansal and Shramjeevi Patrakar Sangh Haryana from newspapers and news websites.',
  alternates: { canonical: '/press' },
};

export default async function Press() {
  const c = await getContent();
  const items = visible(c.coverage);
  return (
    <>
      <PageHead title="In the News" sub={c.settings.pressIntro} />
      <Sec>
        {items.length ? (
          <div className="cvs">
            {items.map((x) => (
              <CoverageCard key={x.id} c={x} />
            ))}
          </div>
        ) : (
          <p className="empty">News reports will appear here.</p>
        )}
      </Sec>
      <Logos s={c.settings} items={visible(c.pressLogos)} />
      <Connect s={c.settings} />
    </>
  );
}
