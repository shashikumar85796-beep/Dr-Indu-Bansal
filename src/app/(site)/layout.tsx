import type { ReactNode } from 'react';
import { Effects } from '@/components/site/Effects';
import { FloatingTools } from '@/components/site/FloatingTools';
import { Footer } from '@/components/site/Footer';
import { Header } from '@/components/site/Header';
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
      <Header logoFirst={s.logoFirst} logoAccent={s.logoAccent} tagline={s.tagline} joinCta={s.joinCta} />
      <main id="app">{children}</main>
      <Footer s={s} />
      <FloatingTools whatsapp={s.whatsapp} greeting={s.waGreeting} showWa={s.showWhatsApp} />
      <Effects />
      <noscript>
        <style>{'.rv,.ld{opacity:1!important;transform:none!important}#pl{display:none}'}</style>
      </noscript>
    </>
  );
}
