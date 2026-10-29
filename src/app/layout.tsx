import type { Metadata, Viewport } from 'next';
import type { CSSProperties, ReactNode } from 'react';
import { getContent } from '@/lib/store';
import { fontVars } from './fonts';
import './globals.css';

export async function generateMetadata(): Promise<Metadata> {
  const { settings: s } = await getContent();
  return {
    title: { default: s.seoTitle, template: `%s · ${s.seoSuffix}` },
    description: s.seoDescription,
    openGraph: { title: s.seoTitle, description: s.ogDescription, type: 'website' },
  };
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const { settings: s } = await getContent();
  // Runs before first paint: applies the visitor's saved theme and shows the intro only once per tab.
  const init = `(function(){try{var d=document.documentElement,t=localStorage.getItem('theme');if(t)d.dataset.theme=t;if(sessionStorage.getItem('pl'))d.classList.add('nopl');sessionStorage.setItem('pl','1')}catch(e){}})()`;

  return (
    <html
      lang="en"
      className={fontVars}
      style={{ '--red': s.accentColor } as CSSProperties}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: init }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
