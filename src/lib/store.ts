import 'server-only';
import { promises as fs } from 'fs';
import path from 'path';
import { Redis } from '@upstash/redis';
import { del, list, put } from '@vercel/blob';
import { seedContent } from './seed';
import type { CollectionKey, Content, Submission } from './types';

/*
 * Storage has two backends:
 * - Hosted (Vercel): Upstash Redis for content, inbox and login data; Vercel Blob for images.
 * - Local: JSON files and an uploads folder under DATA_DIR (default ./data).
 * Each is picked automatically from the environment variables that are present.
 */

const redisUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const redis = redisUrl && redisToken ? new Redis({ url: redisUrl, token: redisToken }) : null;
export const useBlob = Boolean(process.env.BLOB_READ_WRITE_TOKEN);

// Data is read at runtime, so keep it out of the build's file tracing.
export const DATA_DIR = path.resolve(/*turbopackIgnore: true*/ process.env.DATA_DIR || path.join(/*turbopackIgnore: true*/ process.cwd(), 'data'));
export const UPLOAD_DIR = path.join(DATA_DIR, 'uploads');
const MAX_SUBMISSIONS = 1000;
const PREFIX = process.env.STORE_PREFIX || 'site';

function noStorage(): never {
  throw new Error('No storage is connected. Add Upstash Redis to this Vercel project (Storage tab), then redeploy.');
}

/** Reads a JSON document; creates it from `fallback` when missing. */
export async function readDoc<T>(name: string, fallback: () => T): Promise<T> {
  if (redis) {
    const v = await redis.get<T>(`${PREFIX}:${name}`);
    if (v != null) return v;
    const fresh = fallback();
    await redis.set(`${PREFIX}:${name}`, fresh);
    return fresh;
  }
  const file = path.join(DATA_DIR, `${name}.json`);
  try {
    return JSON.parse(await fs.readFile(file, 'utf8')) as T;
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code !== 'ENOENT') throw e;
    const fresh = fallback();
    // Vercel's filesystem is read-only: serve defaults until storage is connected.
    if (!process.env.VERCEL) await writeDoc(name, fresh);
    return fresh;
  }
}

export async function writeDoc(name: string, data: unknown) {
  if (redis) {
    await redis.set(`${PREFIX}:${name}`, data);
    return;
  }
  if (process.env.VERCEL) noStorage();
  const file = path.join(DATA_DIR, `${name}.json`);
  await fs.mkdir(path.dirname(file), { recursive: true });
  const tmp = `${file}.${process.pid}.${Date.now()}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(data, null, 2), { mode: 0o600 });
  await fs.rename(tmp, file);
}

// All writes in this process go through one queue so concurrent saves never interleave.
let queue: Promise<unknown> = Promise.resolve();
function serial<T>(fn: () => Promise<T>): Promise<T> {
  const run = queue.then(fn, fn);
  queue = run.catch(() => {});
  return run;
}

/** Fills in any keys missing from older content with the seed defaults. */
export function normalize(raw: Partial<Content>): Content {
  const seed = seedContent();
  const out = { ...seed, settings: { ...seed.settings, ...(raw.settings || {}) } } as Content;
  for (const key of Object.keys(seed) as (keyof Content)[]) {
    if (key === 'settings') continue;
    const items = raw[key];
    if (Array.isArray(items)) (out as unknown as Record<string, unknown>)[key] = items;
  }
  return out;
}

export async function getContent(): Promise<Content> {
  return normalize(await readDoc<Partial<Content>>('content', seedContent));
}

export function updateContent(fn: (c: Content) => void | Content) {
  return serial(async () => {
    const draft = structuredClone(await getContent());
    const next = fn(draft) || draft;
    await writeDoc('content', next);
    return next;
  });
}

export async function getCollection<K extends CollectionKey>(key: K): Promise<Content[K]> {
  return (await getContent())[key];
}

export async function getSubmissions(): Promise<Submission[]> {
  return readDoc<Submission[]>('submissions', () => []);
}

export function updateSubmissions(fn: (items: Submission[]) => Submission[] | void) {
  return serial(async () => {
    const items = await getSubmissions();
    const next = (fn(items) || items).slice(0, MAX_SUBMISSIONS);
    await writeDoc('submissions', next);
    return next;
  });
}

/* ---------- images ---------- */

export const UPLOAD_NAME = /^[a-z0-9-]+\.(jpg|jpeg|png|webp|gif|avif)$/;
export type StoredFile = { name: string; url: string; size: number; mtime: number };

export async function saveUpload(name: string, data: Uint8Array, contentType: string): Promise<string> {
  if (useBlob) {
    const blob = await put(`uploads/${name}`, Buffer.from(data), {
      access: 'public',
      contentType,
      addRandomSuffix: false,
      cacheControlMaxAge: 31536000,
    });
    return blob.url;
  }
  if (process.env.VERCEL) throw new Error('Image storage is not connected. Add a public Vercel Blob store to this project, then redeploy.');
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  await fs.writeFile(path.join(UPLOAD_DIR, name), data);
  return `/uploads/${name}`;
}

export async function listUploads(): Promise<StoredFile[]> {
  if (useBlob) {
    const out: StoredFile[] = [];
    let cursor: string | undefined;
    do {
      const page = await list({ prefix: 'uploads/', cursor, limit: 1000 });
      for (const b of page.blobs) out.push({ name: b.pathname.slice('uploads/'.length), url: b.url, size: b.size, mtime: new Date(b.uploadedAt).getTime() });
      cursor = page.hasMore ? page.cursor : undefined;
    } while (cursor);
    return out.sort((a, b) => b.mtime - a.mtime);
  }
  try {
    const names = (await fs.readdir(UPLOAD_DIR)).filter((n) => UPLOAD_NAME.test(n));
    const files = await Promise.all(
      names.map(async (name) => {
        const st = await fs.stat(path.join(UPLOAD_DIR, name));
        return { name, url: `/uploads/${name}`, size: st.size, mtime: st.mtimeMs };
      }),
    );
    return files.sort((a, b) => b.mtime - a.mtime);
  } catch {
    return [];
  }
}

export async function removeUpload(name: string) {
  if (!UPLOAD_NAME.test(name)) throw new Error('Invalid file.');
  if (useBlob) await del(`uploads/${name}`);
  else await fs.unlink(path.join(UPLOAD_DIR, name));
}

/** Where saved data lives, for the dashboard. */
export const storageLabel = () =>
  `${redis ? 'Upstash Redis' : process.env.VERCEL ? 'not connected' : 'local data folder'} · images: ${useBlob ? 'Vercel Blob' : process.env.VERCEL ? 'not connected' : 'local data folder'}`;
