import type { Metadata } from 'next';
import { PageHead, Sec } from '@/components/site/blocks';
import { ContactForm } from '@/components/site/Forms';
import { Icon } from '@/components/site/Icon';
import { getContent } from '@/lib/store';
import { lines } from '@/lib/utils';

export const metadata: Metadata = { title: 'Contact' };

export default async function Contact() {
  const { settings: s } = await getContent();
  const info: [string, string, React.ReactNode][] = [];
  if (s.location) info.push(['pin', 'Based in', s.location]);
  if (s.phone)
    info.push([
      'ph',
      'Phone / WhatsApp',
      <a key="p" href={`tel:${s.phone.replace(/[^\d+]/g, '')}`} style={{ color: 'var(--red)' }}>
        {s.phone}
      </a>,
    ]);
  if (s.email)
    info.push([
      'mail',
      'Email',
      <a key="e" href={`mailto:${s.email}`} style={{ color: 'var(--red)' }}>
        {s.email}
      </a>,
    ]);
  if (s.instagram)
    info.push([
      'ig',
      'Instagram',
      <a key="i" href={s.instagram} target="_blank" rel="noopener" style={{ color: 'var(--red)' }}>
        {s.instagramHandle || 'Instagram'}
      </a>,
    ]);
  return (
    <>
      <PageHead title="Contact" sub={s.contactIntro} />
      <Sec>
        <div className="ct">
          <ContactForm topics={lines(s.contactTopics)} whatsapp={s.whatsapp} note={s.contactNote} />
          <div className="ci">
            {info.map(([icon, label, value]) => (
              <div key={label}>
                <Icon name={icon} />
                <p style={{ margin: 0 }}>
                  <b>{label}</b>
                  <span>{value}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      </Sec>
    </>
  );
}
