import Link from 'next/link';
import { NAV } from '@/lib/nav';
import type { Settings } from '@/lib/types';
import { lines } from '@/lib/utils';
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
        </div>
        <div>
          <h4>Quick Links</h4>
          <div style={{ columns: 2 }}>
            {NAV.map(([href, label]) => (
              <Link key={href} href={href}>
                {label}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <h4>Follow Me</h4>
          <Socials s={s} />
        </div>
        {script.length ? (
          <div className="sc" style={{ position: 'static', fontSize: 26, transform: 'rotate(-6deg)', width: 'fit-content' }}>
            {script.map((l, i) => (
              <span key={i}>
                {i ? <br /> : null}
                {l}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </footer>
  );
}
