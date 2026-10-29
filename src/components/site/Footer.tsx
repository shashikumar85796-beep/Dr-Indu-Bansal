import Link from 'next/link';
import type { Settings } from '@/lib/types';
import { waLink } from '@/lib/utils';
import { Socials } from './blocks';

const EXPLORE: [string, string][] = [
  ['/', 'Home'],
  ['/about', 'About'],
  ['/updates', 'Updates'],
  ['/media', 'Videos'],
  ['/gallery', 'Photo gallery'],
  ['/awards', 'Awards & honours'],
];

const SANGH: [string, string][] = [
  ['/sangh', 'About the Sangh'],
  ['/sangh#demands', 'Our demands'],
  ['/sangh#units', 'District units'],
  ['/press', 'In the news'],
  ['/join', 'Become a member'],
  ['/contact', 'Contact'],
];

export function Footer({ s }: { s: Settings }) {
  return (
    <footer className="ftr">
      <div className="w ftr-top">
        <div className="ftr-brand">
          <Link href="/" className="ftr-logo">
            {s.logoFirst} <i>{s.logoAccent}</i>
          </Link>
          <p className="ftr-tag">{s.tagline}</p>
          <p className="ftr-text">{s.footerText}</p>
          <Socials s={s} size={18} withWhatsApp />
        </div>
        <nav aria-label="Explore">
          <h4>Explore</h4>
          {EXPLORE.map(([href, label]) => (
            <Link key={href} href={href}>
              {label}
            </Link>
          ))}
        </nav>
        <nav aria-label="The Sangh">
          <h4>The Sangh</h4>
          {SANGH.map(([href, label]) => (
            <Link key={href} href={href}>
              {label}
            </Link>
          ))}
        </nav>
        <div className="ftr-contact">
          <h4>Get in touch</h4>
          {s.location ? (
            <p>
              <span>Based in</span>
              {s.location}
            </p>
          ) : null}
          {s.phone ? (
            <p>
              <span>Phone</span>
              <a href={`tel:${s.phone.replace(/[^\d+]/g, '')}`}>{s.phone}</a>
            </p>
          ) : null}
          {s.email ? (
            <p>
              <span>Email</span>
              <a href={`mailto:${s.email}`}>{s.email}</a>
            </p>
          ) : null}
          {s.whatsapp ? (
            <a className="btn ftr-wa" href={waLink(s.whatsapp, s.waGreeting)} target="_blank" rel="noopener">
              Message on WhatsApp
            </a>
          ) : null}
        </div>
      </div>
      <div className="ftr-bottom">
        <div className="w ftr-bottom-in">
          <span>
            © {new Date().getFullYear()} {s.personName}. All rights reserved.
          </span>
          <span>{s.sanghName}</span>
        </div>
      </div>
    </footer>
  );
}
