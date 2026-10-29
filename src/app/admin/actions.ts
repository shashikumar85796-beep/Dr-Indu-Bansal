'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import {
  assertCollection,
  assertManager,
  assertOwner,
  assertPerm,
  assertSession,
  canSetupFromUi,
  checkLogin,
  checkOwnPassword,
  createSession,
  deleteMember,
  destroySession,
  hasPassword,
  saveMember,
  setLogin,
  setMemberLogin,
} from '@/lib/auth';
import type { Session } from '@/lib/roles';
import { allow, clientIp } from '@/lib/ratelimit';
import { COLLECTIONS, SETTINGS_FIELDS, isCollection, type Field } from '@/lib/schema';
import { getContent, normalize, removeUpload, updateContent, updateSubmissions } from '@/lib/store';
import type { AnyItem, Content, Settings, Story } from '@/lib/types';
import { newId, slugify } from '@/lib/utils';

type Result = { ok: true; id?: string; message?: string } | { ok: false; error: string };

const fail = (e: unknown): Result => ({ ok: false, error: e instanceof Error ? e.message : 'Something went wrong.' });
const refresh = () => revalidatePath('/', 'layout');

// Only http(s), site-relative, in-page, mail and phone links are stored; anything else (e.g. javascript:) is dropped.
const safeUrl = (v: string) => (/^(https?:\/\/|\/(?!\/)|#|mailto:|tel:)/i.test(v) ? v : '');

function clean(field: Field, raw: unknown): unknown {
  switch (field.type) {
    case 'bool':
      return raw === true || raw === 'true' || raw === 'on';
    case 'number': {
      const n = Number(raw);
      return Number.isFinite(n) ? Math.max(0, Math.min(99, Math.round(n))) : 0;
    }
    case 'color':
      return /^#[0-9a-f]{6}$/i.test(String(raw)) ? String(raw) : '#d3141c';
    case 'digits':
      return String(raw ?? '').replace(/\D/g, '').slice(0, 15);
    case 'url':
    case 'image':
      return safeUrl(String(raw ?? '').trim().slice(0, 1000));
    default:
      return String(raw ?? '').replace(/\r\n/g, '\n').trim().slice(0, 20000);
  }
}

/* ---------- auth ---------- */

export async function loginAction(_: unknown, fd: FormData): Promise<{ error?: string }> {
  const ip = await clientIp();
  if (!allow(`login:${ip}`, 8, 15 * 60_000)) return { error: 'Too many attempts. Please wait 15 minutes.' };
  const username = String(fd.get('username') || '');
  const password = String(fd.get('password') || '');
  let session: Session | null;
  if (!(await hasPassword())) {
    if (!canSetupFromUi()) return { error: 'Set SUPERADMIN_USERNAME and SUPERADMIN_PASSWORD on the server first.' };
    if (!username.trim()) return { error: 'Choose a login ID.' };
    if (password.length < 8) return { error: 'Use at least 8 characters.' };
    if (password !== String(fd.get('confirm') || '')) return { error: 'The two passwords do not match.' };
    await setLogin('owner', password, username);
    session = await checkLogin(username, password);
  } else {
    session = await checkLogin(username, password);
  }
  if (!session) return { error: 'Wrong login ID or password.' };
  await createSession(session);
  redirect('/admin');
}

export async function logoutAction() {
  await destroySession();
  redirect('/admin/login');
}

/** Changes the signed-in user's own login. */
export async function changePassword(current: string, next: string, username?: string): Promise<Result> {
  try {
    const s = await assertSession();
    if (!(await checkOwnPassword(s, current))) return { ok: false, error: 'Current password is wrong.' };
    if (next.length < 8) return { ok: false, error: 'Use at least 8 characters.' };
    if (username !== undefined && !username.trim()) return { ok: false, error: 'Login ID cannot be empty.' };
    if (s.role === 'member') await setMemberLogin(s.id, next, username);
    else await setLogin(s.role, next, username);
    const fresh = await checkLogin(username || s.username, next);
    if (fresh) await createSession(fresh);
    return { ok: true, message: 'Login details changed. Your other devices have been signed out.' };
  } catch (e) {
    return fail(e);
  }
}

/** Owner sets or resets the admin's login. */
export async function setAdminLogin(username: string, password: string): Promise<Result> {
  try {
    await assertOwner();
    if (!username.trim()) return { ok: false, error: 'Login ID cannot be empty.' };
    if (password.length < 8) return { ok: false, error: 'Use at least 8 characters.' };
    await setLogin('admin', password, username);
    return { ok: true, message: 'Admin login saved. The admin has been signed out everywhere.' };
  } catch (e) {
    return fail(e);
  }
}

/* ---------- team ---------- */

export async function saveTeamMember(input: { id?: string; username: string; name: string; password?: string; perms: string[]; active: boolean }): Promise<Result> {
  try {
    await assertManager();
    const id = await saveMember(input);
    return { ok: true, id, message: input.id ? 'Team member updated.' : 'Team member added. Share the login privately.' };
  } catch (e) {
    return fail(e);
  }
}

export async function removeTeamMember(id: string): Promise<Result> {
  try {
    await assertManager();
    await deleteMember(id);
    return { ok: true, message: 'Team member removed.' };
  } catch (e) {
    return fail(e);
  }
}

/* ---------- settings ---------- */

export async function saveSettings(data: Record<string, unknown>): Promise<Result> {
  try {
    await assertPerm('settings');
    await updateContent((c) => {
      for (const f of SETTINGS_FIELDS) if (f.key in data) (c.settings as unknown as Record<string, unknown>)[f.key] = clean(f, data[f.key]);
    });
    refresh();
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

/* ---------- collections ---------- */

const list = (c: Content, col: string) => c[col as keyof Omit<Content, 'settings'>] as unknown as AnyItem[];

function uniqueSlug(stories: Story[], wanted: string, id: string) {
  const base = slugify(wanted);
  let slug = base;
  for (let n = 2; stories.some((s) => s.slug === slug && s.id !== id); n++) slug = `${base}-${n}`;
  return slug;
}

export async function saveItem(col: string, data: Record<string, unknown>): Promise<Result> {
  try {
    await assertCollection(col);
    if (!isCollection(col)) throw new Error('Unknown section.');
    const def = COLLECTIONS[col];
    for (const f of def.fields) if (f.required && !String(data[f.key] ?? '').trim()) return { ok: false, error: `${f.label} is required.` };

    let savedId = '';
    await updateContent((c) => {
      const items = list(c, col);
      const id = typeof data.id === 'string' && items.some((i) => i.id === data.id) ? data.id : newId();
      const item: AnyItem = { id, published: true };
      for (const f of def.fields) item[f.key] = clean(f, data[f.key]);
      if (col === 'stories') item.slug = uniqueSlug(c.stories, String(item.slug || item.title), id);
      const at = items.findIndex((i) => i.id === id);
      if (at >= 0) items[at] = item;
      else items.unshift(item);
      savedId = id;
    });
    refresh();
    return { ok: true, id: savedId };
  } catch (e) {
    return fail(e);
  }
}

async function mutate(col: string, fn: (items: AnyItem[]) => void): Promise<Result> {
  try {
    await assertCollection(col);
    if (!isCollection(col)) throw new Error('Unknown section.');
    await updateContent((c) => fn(list(c, col)));
    refresh();
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function deleteItem(col: string, id: string) {
  return mutate(col, (items) => {
    const i = items.findIndex((x) => x.id === id);
    if (i >= 0) items.splice(i, 1);
  });
}

export async function moveItem(col: string, id: string, dir: number) {
  return mutate(col, (items) => {
    const i = items.findIndex((x) => x.id === id);
    const j = i + (dir < 0 ? -1 : 1);
    if (i < 0 || j < 0 || j >= items.length) return;
    [items[i], items[j]] = [items[j], items[i]];
  });
}

export async function reorderItems(col: string, ids: string[]) {
  return mutate(col, (items) => {
    const byId = new Map(items.map((x) => [x.id, x]));
    const ordered = ids.map((id) => byId.get(id)).filter((x): x is AnyItem => !!x);
    const rest = items.filter((x) => !ids.includes(x.id));
    items.splice(0, items.length, ...ordered, ...rest);
  });
}

export async function togglePublished(col: string, id: string) {
  return mutate(col, (items) => {
    const it = items.find((x) => x.id === id);
    if (it) it.published = !it.published;
  });
}

export async function duplicateItem(col: string, id: string) {
  return mutate(col, (items) => {
    const i = items.findIndex((x) => x.id === id);
    if (i < 0) return;
    const copy: AnyItem = { ...structuredClone(items[i]), id: newId(), published: false };
    if (typeof copy.title === 'string') copy.title = `${copy.title} (copy)`;
    if (col === 'stories') copy.slug = `${items[i].slug}-copy-${copy.id.slice(-4)}`;
    items.splice(i + 1, 0, copy);
  });
}

/* ---------- inbox ---------- */

export async function setSubmissionRead(ids: string[], read: boolean): Promise<Result> {
  try {
    await assertPerm('inbox');
    await updateSubmissions((l) => l.map((s) => (ids.includes(s.id) ? { ...s, read } : s)));
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function deleteSubmissions(ids: string[]): Promise<Result> {
  try {
    await assertPerm('inbox');
    await updateSubmissions((l) => l.filter((s) => !ids.includes(s.id)));
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

/* ---------- media & backup ---------- */

export async function deleteUpload(name: string): Promise<Result> {
  try {
    await assertPerm('media');
    await removeUpload(name);
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function importContent(json: string): Promise<Result> {
  try {
    await assertManager();
    let raw: Partial<Content>;
    try {
      raw = JSON.parse(json);
    } catch {
      return { ok: false, error: 'That file is not valid JSON.' };
    }
    if (!raw || typeof raw !== 'object' || !raw.settings) return { ok: false, error: 'That file is not a site backup.' };
    const next = normalize(raw);
    // Run every value through the same cleaning as normal saves.
    const settings = { ...next.settings } as unknown as Record<string, unknown>;
    for (const f of SETTINGS_FIELDS) settings[f.key] = clean(f, settings[f.key]);
    next.settings = settings as unknown as Settings;
    for (const [col, def] of Object.entries(COLLECTIONS)) {
      const items = list(next, col).filter((x) => x && typeof x === 'object');
      (next as unknown as Record<string, AnyItem[]>)[col] = items.map((x) => {
        const item: AnyItem = { id: typeof x.id === 'string' && x.id ? x.id : newId(), published: true };
        for (const f of def.fields) item[f.key] = clean(f, x[f.key]);
        if (col === 'stories') item.slug = slugify(String(x.slug || x.title || 'update'));
        return item;
      });
    }
    await updateContent(() => next);
    refresh();
    return { ok: true, message: 'Backup restored.' };
  } catch (e) {
    return fail(e);
  }
}

export async function usageOf(url: string) {
  await assertSession();
  return JSON.stringify(await getContent()).split(JSON.stringify(url).slice(1, -1)).length - 1;
}

/** Adds one gallery photo per uploaded image, newest first. */
export async function addGalleryPhotos(urls: string[], category: string): Promise<Result> {
  try {
    await assertCollection('gallery');
    const clean = urls.map((u) => safeUrl(String(u).trim())).filter(Boolean).slice(0, 100);
    if (!clean.length) return { ok: false, error: 'No photos to add.' };
    await updateContent((c) => {
      c.gallery.unshift(...clean.map((image) => ({ id: newId(), published: true, image, caption: '', category: category.trim().slice(0, 100) })));
    });
    refresh();
    return { ok: true, message: `${clean.length} photo${clean.length === 1 ? '' : 's'} added to the gallery.` };
  } catch (e) {
    return fail(e);
  }
}
