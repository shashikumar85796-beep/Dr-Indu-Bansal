import type { Metadata, Viewport } from 'next';
import type { CSSProperties, ReactNode } from 'react';
import { siteBase, splitKeywords } from '@/lib/seo';
import { getContent } from '@/lib/store';
import { fontVars } from './fonts';
import './globals.css';

export async function generateMetadata(): Promise<Metadata> {
  const { settings: s } = await getContent();
  return {
    metadataBase: siteBase(s.siteUrl),
    title: { default: s.seoTitle, template: `%s · ${s.seoSuffix}` },
    description: s.seoDescription,
    keywords: splitKeywords(s.seoKeywords),
    authors: [{ name: s.personName }],
    creator: s.personName,
    openGraph: { title: s.seoTitle, description: s.ogDescription || s.seoDescription, type: 'website', siteName: s.personName, locale: 'en_IN', images: [{ url: '/og', width: 1200, height: 630, alt: s.personName }] },
    twitter: { card: 'summary_large_image', title: s.seoTitle, description: s.ogDescription || s.seoDescription, images: ['/og'] },
    verification: s.googleVerification ? { google: s.googleVerification } : undefined,
    robots: { index: true, follow: true },
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
