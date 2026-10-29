'use client';

import { useState, type FormEvent } from 'react';
import { changePassword } from '@/app/admin/actions';

export function PasswordForm() {
  const [msg, setMsg] = useState<{ text: string; err?: boolean }>({ text: '' });
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = e.currentTarget;
    const v = (n: string) => (f.elements.namedItem(n) as HTMLInputElement).value;
    if (v('next') !== v('confirm')) return setMsg({ text: 'The new passwords do not match.', err: true });
    setBusy(true);
    const r = await changePassword(v('current'), v('next'));
    setBusy(false);
    setMsg(r.ok ? { text: r.message || 'Password changed.' } : { text: r.error, err: true });
    if (r.ok) f.reset();
  };

  return (
    <form className="form" onSubmit={onSubmit}>
      <h2>Change password</h2>
      <div className="fld">
        <label htmlFor="pw-c">Current password</label>
        <input id="pw-c" name="current" type="password" autoComplete="current-password" required className="pwi" />
      </div>
      <div className="fld">
        <label htmlFor="pw-n">New password</label>
        <input id="pw-n" name="next" type="password" autoComplete="new-password" minLength={8} required className="pwi" />
        <span className="help">At least 8 characters.</span>
      </div>
      <div className="fld">
        <label htmlFor="pw-r">Repeat new password</label>
        <input id="pw-r" name="confirm" type="password" autoComplete="new-password" minLength={8} required className="pwi" />
      </div>
      <p role="status" style={{ color: msg.err ? 'var(--red)' : '#1a9b4b', fontWeight: 600, minHeight: '1.2em' }}>
        {msg.text}
      </p>
      <button className="btn" disabled={busy} style={{ justifySelf: 'start' }}>
        {busy ? 'Saving…' : 'Change password'}
      </button>
    </form>
  );
}
