import 'server-only';
import crypto from 'crypto';
import { promises as fs } from 'fs';
import path from 'path';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SignJWT, jwtVerify } from 'jose';
import { DATA_DIR, writeJson } from './store';

const AUTH_FILE = path.join(DATA_DIR, 'auth.json');
const COOKIE = 'admin_session';
const MAX_AGE = 7 * 24 * 3600;

interface AuthFile {
  secret: string;
  salt?: string;
  hash?: string;
  ver?: number;
}

async function readAuth(): Promise<AuthFile> {
  try {
    return JSON.parse(await fs.readFile(AUTH_FILE, 'utf8')) as AuthFile;
  } catch {
    const fresh: AuthFile = { secret: crypto.randomBytes(32).toString('hex'), ver: 0 };
    await writeJson(AUTH_FILE, fresh);
    return fresh;
  }
}

const key = async () => new TextEncoder().encode(process.env.SESSION_SECRET || (await readAuth()).secret);
const hashPw = (pw: string, salt: string) => crypto.scryptSync(pw, salt, 64);

export async function hasPassword() {
  return Boolean((await readAuth()).hash || process.env.ADMIN_PASSWORD);
}

/** A first password can be created from the login page only in development. */
export const canSetupFromUi = () => process.env.NODE_ENV !== 'production';

export async function checkPassword(pw: string) {
  const a = await readAuth();
  if (a.hash && a.salt) {
    const stored = Buffer.from(a.hash, 'hex');
    const given = hashPw(pw, a.salt);
    return given.length === stored.length && crypto.timingSafeEqual(given, stored);
  }
  const env = process.env.ADMIN_PASSWORD;
  if (!env) return false;
  const x = crypto.createHash('sha256').update(pw).digest();
  const y = crypto.createHash('sha256').update(env).digest();
  return crypto.timingSafeEqual(x, y);
}

/** Saves a new password and signs out every existing session. */
export async function setPassword(pw: string) {
  const a = await readAuth();
  a.salt = crypto.randomBytes(16).toString('hex');
  a.hash = hashPw(pw, a.salt).toString('hex');
  a.ver = (a.ver || 0) + 1;
  await writeJson(AUTH_FILE, a);
}

export async function createSession() {
  const a = await readAuth();
  const token = await new SignJWT({ v: a.ver || 0 })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(await key());
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production' && process.env.COOKIE_SECURE !== 'false',
    path: '/',
    maxAge: MAX_AGE,
  });
}

export async function destroySession() {
  (await cookies()).delete(COOKIE);
}

export async function isAdmin() {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, await key());
    return payload.v === ((await readAuth()).ver || 0);
  } catch {
    return false;
  }
}

export async function requireAdmin() {
  if (!(await isAdmin())) redirect('/admin/login');
}

export async function assertAdmin() {
  if (!(await isAdmin())) throw new Error('Your session has expired. Please sign in again.');
}
