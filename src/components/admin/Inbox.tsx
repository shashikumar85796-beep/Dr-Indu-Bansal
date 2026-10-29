'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';
import { deleteSubmissions, setSubmissionRead } from '@/app/admin/actions';
import type { Submission } from '@/lib/types';
import { waLink } from '@/lib/utils';
import { useToast } from './useToast';

const LABELS: Record<string, string> = {
  name: 'Name',
  email: 'Email',
  topic: 'Topic',
  message: 'Message',
  phone: 'Phone',
  organisation: 'Media organisation',
  district: 'District',
  role: 'Role',
  pressCard: 'Press card',
  note: 'Note',
};

export function Inbox({ subs: initial }: { subs: Submission[] }) {
  const router = useRouter();
  const [subs, setSubs] = useState(initial);
  const [open, setOpen] = useState<string | null>(null);
  const [kind, setKind] = useState<'all' | 'contact' | 'join' | 'unread'>('all');
  const [q, setQ] = useState('');
  const [, start] = useTransition();
  const [toast, toastNode] = useToast();

  useEffect(() => setSubs(initial), [initial]);

  const act = (fn: () => Promise<{ ok: boolean; error?: string }>, optimistic: (l: Submission[]) => Submission[], msg?: string) => {
    setSubs(optimistic);
    start(async () => {
      const r = await fn();
      if (!r.ok) toast(r.error || 'Something went wrong.', true);
      else if (msg) toast(msg);
      router.refresh();
    });
  };

  const toggle = (s: Submission) => {
    setOpen(open === s.id ? null : s.id);
    if (!s.read) act(() => setSubmissionRead([s.id], true), (l) => l.map((x) => (x.id === s.id ? { ...x, read: true } : x)));
  };

  const query = q.trim().toLowerCase();
  const shown = subs.filter(
    (s) =>
      (kind === 'all' || (kind === 'unread' ? !s.read : s.kind === kind)) && (!query || Object.values(s.fields).join(' ').toLowerCase().includes(query)),
  );
  const unreadIds = subs.filter((s) => !s.read).map((s) => s.id);

  return (
    <>
      <div className="tools">
        <input type="search" placeholder="Search messages" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search messages" />
        <select value={kind} onChange={(e) => setKind(e.target.value as typeof kind)} aria-label="Filter">
          <option value="all">All ({subs.length})</option>
          <option value="unread">Unread ({unreadIds.length})</option>
          <option value="contact">Contact messages</option>
          <option value="join">Membership requests</option>
        </select>
        {unreadIds.length ? (
          <button className="btn sm ghost" onClick={() => act(() => setSubmissionRead(unreadIds, true), (l) => l.map((x) => ({ ...x, read: true })), 'All marked as read.')}>
            Mark all read
          </button>
        ) : null}
      </div>
      {shown.length ? (
        shown.map((s) => {
          const f = s.fields;
          const date = new Date(s.createdAt);
          return (
            <div key={s.id} className={`msg${s.read ? '' : ' unread'}`}>
              <button onClick={() => toggle(s)} aria-expanded={open === s.id}>
                <span className="dot" />
                <span style={{ minWidth: 0 }}>
                  <b>{f.name || 'Anonymous'}</b> <span className="pill">{s.kind === 'join' ? 'Membership' : f.topic || 'Contact'}</span>
                  <span className="pre" style={{ display: 'block' }}>
                    {s.kind === 'join' ? [f.role, f.organisation, f.district].filter(Boolean).join(' · ') : f.message}
                  </span>
                </span>
                <span className="muted small" title={date.toLocaleString()}>
                  {date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </button>
              {open === s.id ? (
                <>
                  <dl>
                    <dt>Received</dt>
                    <dd>{date.toLocaleString('en-IN')}</dd>
                    {Object.entries(f)
                      .filter(([, v]) => v)
                      .map(([k, v]) => (
                        <div key={k} style={{ display: 'contents' }}>
                          <dt>{LABELS[k] || k}</dt>
                          <dd>{v}</dd>
                        </div>
                      ))}
                  </dl>
                  <div className="acts">
                    {f.phone ? (
                      <a className="btn sm" href={waLink(f.phone.replace(/\D/g, '').length === 10 ? `91${f.phone}` : f.phone, `Hello ${f.name || ''},`)} target="_blank" rel="noopener">
                        Reply on WhatsApp
                      </a>
                    ) : null}
                    {f.email ? (
                      <a className="btn sm ghost" href={`mailto:${f.email}`}>
                        Reply by email
                      </a>
                    ) : null}
                    <button className="btn sm ghost" onClick={() => act(() => setSubmissionRead([s.id], false), (l) => l.map((x) => (x.id === s.id ? { ...x, read: false } : x)))}>
                      Mark unread
                    </button>
                    <button
                      className="btn sm danger"
                      onClick={() => {
                        if (confirm('Delete this message?')) act(() => deleteSubmissions([s.id]), (l) => l.filter((x) => x.id !== s.id), 'Message deleted.');
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </>
              ) : null}
            </div>
          );
        })
      ) : (
        <div className="card muted">{subs.length ? 'No messages match.' : 'No messages yet. Forms on the Contact and Join pages arrive here.'}</div>
      )}
      {toastNode}
    </>
  );
}
