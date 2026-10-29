'use client';

import { useState, type FormEvent } from 'react';
import { submitForm } from '@/app/(site)/actions';
import { waLink } from '@/lib/utils';

const read = (f: HTMLFormElement) => Object.fromEntries([...new FormData(f).entries()].map(([k, v]) => [k, String(v)]));

/** Marks empty required fields; returns true when all are filled. */
function check(f: HTMLFormElement, names: string[]) {
  let ok = true;
  for (const n of names) {
    const el = f.elements.namedItem(n) as HTMLInputElement | null;
    if (!el) continue;
    const bad = el.type === 'checkbox' ? !el.checked : !el.value.trim();
    if (el.type === 'checkbox') el.parentElement!.style.color = bad ? 'var(--red)' : '';
    else el.classList.toggle('bad', bad);
    if (bad) ok = false;
  }
  return ok;
}

const clearBad = (e: FormEvent<HTMLFormElement>) => (e.target as HTMLElement).classList.remove('bad');

const Honeypot = () => <input className="hp-f" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />;

/** Opens WhatsApp first (must happen inside the click), then saves a copy to the inbox in the background. */
async function send(kind: 'contact' | 'join', data: Record<string, string>, whatsapp: string, text: string) {
  if (whatsapp) window.open(waLink(whatsapp, text), '_blank', 'noopener');
  try {
    const r = await submitForm(kind, data);
    // Once WhatsApp has opened the visitor's message is on its way, even if the inbox copy failed.
    return whatsapp ? { ok: true } : r;
  } catch {
    return { ok: !!whatsapp, error: 'Could not send. Please try again.' };
  }
}

export function ContactForm({ topics, whatsapp, note }: { topics: string[]; whatsapp: string; note: string }) {
  const [msg, setMsg] = useState('');
  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = e.currentTarget;
    if (!check(f, ['message'])) return setMsg('Please write a message first.');
    const d = read(f);
    setMsg(whatsapp ? 'Opening WhatsApp…' : 'Sending…');
    const text = [`*${d.topic}*`, `Name: ${d.name || '-'}`, `Email: ${d.email || '-'}`, '', d.message].join('\n');
    const r = await send('contact', d, whatsapp, text);
    if (r.ok) {
      setMsg('Thank you. Your message has been sent.');
      f.reset();
    } else setMsg(r.error || 'Could not send. Please try again.');
  };
  return (
    <form className="fm" noValidate onSubmit={onSubmit} onInput={clearBad}>
      <Honeypot />
      <div className="r">
        <input name="name" placeholder="Your name" aria-label="Name" autoComplete="name" maxLength={200} />
        <input name="email" type="email" placeholder="Email (optional)" aria-label="Email" autoComplete="email" maxLength={200} />
      </div>
      <select name="topic" aria-label="Topic">
        {topics.map((t) => (
          <option key={t}>{t}</option>
        ))}
      </select>
      <textarea name="message" rows={6} placeholder="Your message" aria-label="Message" maxLength={4000} />
      <button className="btn" style={{ justifySelf: 'start' }} type="submit">
        {whatsapp ? 'Send via WhatsApp →' : 'Send message →'}
      </button>
      <p className="ok-msg" role="status">
        {msg}
      </p>
      <p className="hn">
        {note} Want to become a member?{' '}
        <a href="/join" style={{ color: 'var(--red)' }}>
          Join the Sangh
        </a>
        .
      </p>
    </form>
  );
}

export function JoinForm({ districts, roles, whatsapp, note }: { districts: string[]; roles: string[]; whatsapp: string; note: string }) {
  const [msg, setMsg] = useState('');
  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = e.currentTarget;
    let ok = check(f, ['name', 'phone', 'district', 'role', 'consent']);
    const phone = f.elements.namedItem('phone') as HTMLInputElement;
    if (phone.value.replace(/\D/g, '').length < 10) {
      phone.classList.add('bad');
      ok = false;
    }
    if (!ok) return setMsg('Please fill the highlighted fields.');
    const d = read(f);
    d.pressCard = d.pressCard ? 'Yes' : 'No';
    setMsg(whatsapp ? 'Opening WhatsApp with your details…' : 'Sending…');
    const text = [
      '*Membership request: Shramjeevi Patrakar Sangh Haryana*',
      `Name: ${d.name}`,
      `Phone: ${d.phone}`,
      `Email: ${d.email || '-'}`,
      `District: ${d.district}`,
      `Media organisation: ${d.organisation || '-'}`,
      `Role: ${d.role}`,
      `Press card: ${d.pressCard}`,
      d.note ? `Note: ${d.note}` : '',
    ]
      .filter(Boolean)
      .join('\n');
    const r = await send('join', d, whatsapp, text);
    if (r.ok) {
      setMsg('Thank you. Your membership request has been sent.');
      f.reset();
    } else setMsg(r.error || 'Could not send. Please try again.');
  };
  return (
    <form className="fm" noValidate onSubmit={onSubmit} onInput={clearBad}>
      <Honeypot />
      <div className="r">
        <input name="name" placeholder="Full name *" aria-label="Full name" autoComplete="name" maxLength={200} />
        <input name="phone" type="tel" inputMode="tel" placeholder="Mobile number *" aria-label="Mobile number" autoComplete="tel" maxLength={20} />
      </div>
      <div className="r">
        <input name="email" type="email" placeholder="Email (optional)" aria-label="Email" autoComplete="email" maxLength={200} />
        <input name="organisation" placeholder="Newspaper / channel / portal" aria-label="Media organisation" maxLength={200} />
      </div>
      <div className="r">
        <select name="district" aria-label="District" defaultValue="">
          <option value="">District *</option>
          {districts.map((d) => (
            <option key={d}>{d}</option>
          ))}
        </select>
        <select name="role" aria-label="Role" defaultValue="">
          <option value="">Role *</option>
          {roles.map((d) => (
            <option key={d}>{d}</option>
          ))}
        </select>
      </div>
      <label className="ck">
        <input type="checkbox" name="pressCard" /> I hold a press card or accreditation
      </label>
      <textarea name="note" rows={3} placeholder="Anything you would like to add (optional)" aria-label="Note" maxLength={4000} />
      <label className="ck">
        <input type="checkbox" name="consent" /> I agree to be contacted by the Sangh about my membership *
      </label>
      <button className="btn" style={{ justifySelf: 'start' }} type="submit">
        {whatsapp ? 'Send via WhatsApp →' : 'Send request →'}
      </button>
      <p className="ok-msg" role="status">
        {msg}
      </p>
      <p className="hn">{note}</p>
    </form>
  );
}
