import { ImageResponse } from 'next/og';
import { getContent } from '@/lib/store';

// Default 1200×630 share card for pages without their own image.
export async function GET() {
  const { settings: s } = await getContent();
  const host = s.siteUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', background: '#ffffff', fontFamily: 'Georgia, serif' }}>
        <div style={{ width: 28, height: '100%', background: s.accentColor || '#d3141c' }} />
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 80px', flex: 1 }}>
          <div style={{ fontSize: 26, letterSpacing: 4, color: s.accentColor || '#d3141c', textTransform: 'uppercase', fontFamily: 'Arial, sans-serif' }}>
            {s.heroEyebrow}
          </div>
          <div style={{ fontSize: 104, fontWeight: 700, color: '#16161a', marginTop: 18, lineHeight: 1 }}>{s.heroName || s.personName}</div>
          <div style={{ fontSize: 34, color: '#55555c', marginTop: 28, fontFamily: 'Arial, sans-serif', maxWidth: 900 }}>{s.tagline}</div>
          <div style={{ fontSize: 26, color: '#8a8a92', marginTop: 44, fontFamily: 'Arial, sans-serif' }}>{host}</div>
        </div>
      </div>
    ),
    { width: 1200, height: 630, headers: { 'Cache-Control': 'public, max-age=86400' } },
  );
}
