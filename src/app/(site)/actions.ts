'use server';

import { allow, clientIp } from '@/lib/ratelimit';
import { getContent, updateSubmissions } from '@/lib/store';
import { newId } from '@/lib/utils';

const FIELDS: Record<'contact' | 'join', string[]> = {
  contact: ['name', 'email', 'topic', 'message'],
  join: ['name', 'phone', 'email', 'organisation', 'district', 'role', 'pressCard', 'note'],
};

/** Saves a contact or membership message to the admin inbox. The visitor's WhatsApp handoff happens in the browser. */
export async function submitForm(kind: 'contact' | 'join', data: Record<string, string>) {
  if (kind !== 'contact' && kind !== 'join') return { ok: false };
  if (data.website) return { ok: true }; // honeypot: quietly drop bots
  if (!allow(`form:${await clientIp()}`, 6, 10 * 60_000)) return { ok: false, error: 'Too many messages. Please try again later.' };

  const fields: Record<string, string> = {};
  for (const k of FIELDS[kind]) fields[k] = String(data[k] ?? '').trim().slice(0, k === 'message' || k === 'note' ? 4000 : 200);
  if (kind === 'contact' && !fields.message) return { ok: false, error: 'Please write a message first.' };
  if (kind === 'join' && (!fields.name || fields.phone.replace(/\D/g, '').length < 10 || !fields.district || !fields.role))
    return { ok: false, error: 'Please fill the highlighted fields.' };

  if ((await getContent()).settings.storeSubmissions) {
    await updateSubmissions((list) => [{ id: newId(), kind, createdAt: new Date().toISOString(), read: false, fields }, ...list]);
  }
  return { ok: true };
}
