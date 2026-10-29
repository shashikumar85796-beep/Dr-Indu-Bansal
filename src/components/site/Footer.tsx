import Link from 'next/link';
import { FOOTER_NAV } from '@/lib/nav';
import type { Settings } from '@/lib/types';
import { lines, waLink } from '@/lib/utils';
import { Socials } from './blocks';

export function Footer({ s }: { s: Settings }) {
  const script = lines(s.footerScript);
  return (
    <footer>
      <div className="w ft">
        <div>
          <div className="lg">
            <b>
              {s.logoFirst} <i>{s.logoAccent}</i>
            </b>
            <small>{s.tagline}</small>
          </div>
          {s.footerText}
          <Socials s={s} />
        </div>
        <div>
          <h4>Quick Links</h4>
          <div style={{ columns: 2 }}>
            {FOOTER_NAV.map(([href, label]) => (
              <Link key={href} href={href}>
                {label}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <h4>Contact</h4>
          <div className="fc">
            {s.location ? <span>{s.location}</span> : null}
            {s.phone ? <a href={`tel:${s.phone.replace(/[^\d+]/g, '')}`}>{s.phone}</a> : null}
            {s.email ? <a href={`mailto:${s.email}`}>{s.email}</a> : null}
            {s.whatsapp ? (
              <a href={waLink(s.whatsapp, s.waGreeting)} target="_blank" rel="noopener">
                Chat on WhatsApp ↗
              </a>
            ) : null}
          </div>
        </div>
        {script.length ? (
          <div className="sc" style={{ position: 'static', fontSize: 22, transform: 'none', width: 'fit-content' }}>
            {script.map((l, i) => (
              <span key={i}>
                {i ? <br /> : null}
                {l}
              </span>
            ))}
          </div>
        ) : null}
      </div>
      <div className="w fb">
        <span>
          © {new Date().getFullYear()} {s.personName}. All rights reserved.
        </span>
        <span>{s.tagline.split('|').pop()?.trim()}</span>
      </div>
    </footer>
  );
}
