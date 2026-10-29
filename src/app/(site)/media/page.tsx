import type { Metadata } from 'next';
import { Connect, Logos, PageHead, Sec } from '@/components/site/blocks';
import { Photo } from '@/components/site/Photo';
import { getContent } from '@/lib/store';
import { visible } from '@/lib/utils';

export const metadata: Metadata = { title: 'Media' };

export default async function Media() {
  const c = await getContent();
  const videos = visible(c.videos);
  return (
    <>
      <PageHead title="Video & Podcast" sub={c.settings.mediaIntro} />
      <Sec>
        {videos.length ? (
          <div className="vg">
            {videos.map((v, i) => (
              <a className="vc" key={v.id} href={v.url} target="_blank" rel="noopener" style={{ display: 'block' }}>
                <Photo src={v.image} i={i} sizes="(max-width:560px) 100vw, (max-width:900px) 50vw, 33vw" />
                <h3>{v.title}</h3>
                <span>{v.platform} · Watch ↗</span>
              </a>
            ))}
          </div>
        ) : (
          <p className="empty">Videos are coming soon.</p>
        )}
      </Sec>
      <Logos s={c.settings} items={visible(c.pressLogos)} />
      <Connect s={c.settings} />
    </>
  );
}
