import type { Settings } from '@/lib/types';
import { Socials } from './blocks';

/** Thin contact strip above the main header on larger screens. */
export function TopBar({ s }: { s: Settings }) {
  return (
    <div className="topbar">
      <div className="w topbar-in">
        <div className="topbar-l">
          {s.location ? <span>{s.location}</span> : null}
          {s.phone ? <a href={`tel:${s.phone.replace(/[^\d+]/g, '')}`}>{s.phone}</a> : null}
          {s.email ? <a href={`mailto:${s.email}`}>{s.email}</a> : null}
        </div>
        <div className="topbar-r">
          <span className="topbar-t">Follow</span>
          <Socials s={s} size={14} withWhatsApp />
        </div>
      </div>
    </div>
  );
}
