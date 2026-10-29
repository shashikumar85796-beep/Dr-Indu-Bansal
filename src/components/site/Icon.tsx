import { ICONS } from '@/lib/icons';

export function Icon({ name }: { name: string }) {
  return (
    <span className="ic">
      <svg viewBox="0 0 24 24" aria-hidden="true" dangerouslySetInnerHTML={{ __html: ICONS[name] || ICONS.star }} />
    </span>
  );
}
