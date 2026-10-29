import Script from 'next/script';
import type { ReactNode } from 'react';
import { Effects } from '@/components/site/Effects';
import { FloatingTools } from '@/components/site/FloatingTools';
import { Footer } from '@/components/site/Footer';
import { Header } from '@/components/site/Header';
import { TopBar } from '@/components/site/TopBar';
import { getContent } from '@/lib/store';

export default async function SiteLayout({ children }: { children: ReactNode }) {
  const { settings: s } = await getContent();
  return (
    <>
      {s.showPreloader ? (
        <div id="pl" aria-hidden="true">
          <div className="plc">
            <b>
              {s.logoFirst} <i>{s.logoAccent}</i>
            </b>
            <small>{s.tagline}</small>
            <div className="plb">
              <i />
            </div>
          </div>
        </div>
      ) : null}
      <TopBar s={s} />
      <Header logoFirst={s.logoFirst} logoAccent={s.logoAccent} tagline={s.tagline} joinCta={s.joinCta} />
      <main id="app">{children}</main>
      <Footer s={s} />
      <FloatingTools whatsapp={s.whatsapp} greeting={s.waGreeting} showWa={s.showWhatsApp} />
      <Effects />
      {/^G-[A-Z0-9]{4,20}$/.test(s.ga4MeasurementId) ? (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${s.ga4MeasurementId}`} strategy="afterInteractive" />
          <Script id="ga4" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${s.ga4MeasurementId}');`}
          </Script>
        </>
      ) : null}
      <noscript>
        <style>{'.rv,.ld{opacity:1!important;transform:none!important}#pl{display:none}'}</style>
      </noscript>
    </>
  );
}
