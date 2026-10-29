import type { Metadata } from 'next';
import { Connect, PageHead } from '@/components/site/blocks';
import { UpdatesBrowser } from '@/components/site/UpdatesBrowser';
import { getContent } from '@/lib/store';
import { visible } from '@/lib/utils';

export const metadata: Metadata = { title: 'Updates' };

export default async function Updates() {
  const c = await getContent();
  // The browser only needs card fields, not full story bodies.
  const stories = visible(c.stories).map(({ body: _body, sourceUrl: _src, ...card }) => ({ ...card, body: '', sourceUrl: '' }));
  return (
    <>
      <PageHead title="Updates" sub={c.settings.updatesIntro} />
      <section>
        <div className="w">
          <UpdatesBrowser stories={stories} />
        </div>
      </section>
      <Connect s={c.settings} />
    </>
  );
}
