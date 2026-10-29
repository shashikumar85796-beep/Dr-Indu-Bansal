import { ImageResponse } from 'next/og';
import { getContent } from '@/lib/store';

const clip = (s: string, n: number) => (s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s);

// 1200×630 share card. ?title= and ?sub= give each page its own card; without them it shows the name.
export async function GET(req: Request) {
  const { settings: s } = await getContent();
  const q = new URL(req.url).searchParams;
  const title = clip(q.get('title') || s.heroName || s.personName, 90);
  const sub = clip(q.get('sub') || s.tagline, 140);
  const host = s.siteUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');
  const red = s.accentColor || '#d3141c';
  const big = title.length < 24;
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', background: '#ffffff', fontFamily: 'Georgia, serif' }}>
        <div style={{ width: 28, height: '100%', background: red }} />
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 80px', flex: 1 }}>
          <div style={{ fontSize: 26, letterSpacing: 4, color: red, textTransform: 'uppercase', fontFamily: 'Arial, sans-serif' }}>{s.personName}</div>
          <div style={{ fontSize: big ? 104 : 64, fontWeight: 700, color: '#14181f', marginTop: 18, lineHeight: 1.08 }}>{title}</div>
          <div style={{ fontSize: 32, color: '#5b616c', marginTop: 28, fontFamily: 'Arial, sans-serif', maxWidth: 960, lineHeight: 1.35 }}>{sub}</div>
          <div style={{ fontSize: 26, color: '#8a8a92', marginTop: 40, fontFamily: 'Arial, sans-serif' }}>{host}</div>
        </div>
      </div>
    ),
    { width: 1200, height: 630, headers: { 'Cache-Control': 'public, max-age=86400' } },
  );
}
