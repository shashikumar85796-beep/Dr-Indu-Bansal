import type { Metadata } from 'next';
import { Connect, Hd, Logos, PageHead, Sec, SocialIcon, VideoCard } from '@/components/site/blocks';
import { getContent } from '@/lib/store';
import { visible } from '@/lib/utils';

export const metadata: Metadata = { title: 'Media' };

export default async function Media() {
  const c = await getContent();
  const s = c.settings;
  const videos = visible(c.videos);
  const news = videos.filter((v) => v.section !== 'Songs');
  const songs = videos.filter((v) => v.section === 'Songs');
  const channel = s.youtube ? (
    <a className="btn o" href={s.youtube} target="_blank" rel="noopener">
      <SocialIcon name="YouTube" /> YouTube channel ↗
    </a>
  ) : null;

  return (
    <>
      <PageHead title="Video & Podcast" sub={s.mediaIntro} />
      <Sec>
        <div className="hd">
          <div>
            <span className="ey">Videos</span>
            <h2>News & programmes</h2>
          </div>
          {channel}
        </div>
        {news.length ? (
          <div className="vg">
            {news.map((v, i) => (
              <VideoCard key={v.id} v={v} i={i} />
            ))}
          </div>
        ) : (
          <p className="empty">Videos are coming soon.</p>
        )}
      </Sec>
      {songs.length ? (
        <Sec alt>
          <Hd eyebrow="Sangh Songs" title="Songs of the Sangh" />
          <p className="lead">Struggle and Tiranga Yatra songs of Shramjeevi Patrakar Sangh Haryana in Hindi, Haryanvi, Punjabi, Rajasthani and Braj.</p>
          <div className="vg">
            {songs.map((v, i) => (
              <VideoCard key={v.id} v={v} i={i + 2} />
            ))}
          </div>
        </Sec>
      ) : null}
      <Logos s={s} items={visible(c.pressLogos)} />
      <Connect s={s} />
    </>
  );
}
