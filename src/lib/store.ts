import 'server-only';
import { promises as fs } from 'fs';
import path from 'path';
import { seedContent } from './seed';
import type { CollectionKey, Content, Submission } from './types';

// Data is read at runtime, so keep it out of the build's file tracing.
export const DATA_DIR = path.resolve(/*turbopackIgnore: true*/ process.env.DATA_DIR || path.join(/*turbopackIgnore: true*/ process.cwd(), 'data'));
export const UPLOAD_DIR = path.join(DATA_DIR, 'uploads');
const CONTENT_FILE = path.join(DATA_DIR, 'content.json');
const SUBMISSIONS_FILE = path.join(DATA_DIR, 'submissions.json');
const MAX_SUBMISSIONS = 5000;

export async function writeJson(file: string, data: unknown) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  const tmp = `${file}.${process.pid}.${Date.now()}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(data, null, 2), { mode: 0o600 });
  await fs.rename(tmp, file);
}

async function readJson<T>(file: string, fallback: () => T): Promise<T> {
  try {
    return JSON.parse(await fs.readFile(file, 'utf8')) as T;
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code !== 'ENOENT') throw e;
    const value = fallback();
    await writeJson(file, value);
    return value;
  }
}

// All writes go through one queue so concurrent saves never interleave.
let queue: Promise<unknown> = Promise.resolve();
function serial<T>(fn: () => Promise<T>): Promise<T> {
  const run = queue.then(fn, fn);
  queue = run.catch(() => {});
  return run;
}

/** Fills in any keys missing from older content files with the seed defaults. */
export function normalize(raw: Partial<Content>): Content {
  const seed = seedContent();
  const out = { ...seed, settings: { ...seed.settings, ...(raw.settings || {}) } } as Content;
  for (const key of Object.keys(seed) as (keyof Content)[]) {
    if (key === 'settings') continue;
    const list = raw[key];
    if (Array.isArray(list)) (out as unknown as Record<string, unknown>)[key] = list;
  }
  return out;
}

let cached: { mtime: number; data: Content } | null = null;

export async function getContent(): Promise<Content> {
  try {
    const st = await fs.stat(CONTENT_FILE);
    if (cached && cached.mtime === st.mtimeMs) return cached.data;
  } catch {}
  const data = normalize(await readJson<Partial<Content>>(CONTENT_FILE, seedContent));
  try {
    cached = { mtime: (await fs.stat(CONTENT_FILE)).mtimeMs, data };
  } catch {}
  return data;
}

export function updateContent(fn: (c: Content) => void | Content) {
  return serial(async () => {
    const draft = structuredClone(await getContent());
    const next = fn(draft) || draft;
    await writeJson(CONTENT_FILE, next);
    cached = null;
    return next;
  });
}

export async function getCollection<K extends CollectionKey>(key: K): Promise<Content[K]> {
  return (await getContent())[key];
}

export async function getSubmissions(): Promise<Submission[]> {
  return readJson<Submission[]>(SUBMISSIONS_FILE, () => []);
}

export function updateSubmissions(fn: (list: Submission[]) => Submission[] | void) {
  return serial(async () => {
    const list = await getSubmissions();
    const next = (fn(list) || list).slice(0, MAX_SUBMISSIONS);
    await writeJson(SUBMISSIONS_FILE, next);
    return next;
  });
}

export const UPLOAD_NAME = /^[a-z0-9-]+\.(jpg|jpeg|png|webp|gif|avif)$/;

export async function listUploads() {
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
