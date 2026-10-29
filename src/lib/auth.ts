import 'server-only';
import crypto from 'crypto';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SignJWT, jwtVerify } from 'jose';
import { PERM_IDS, can, canEditCollection, isManager, type Perm, type Session } from './roles';
import { readDoc, writeDoc } from './store';
import { newId } from './utils';

const COOKIE = 'admin_session';
const MAX_AGE = 7 * 24 * 3600;

type Main = 'owner' | 'admin';
const MAINS: Main[] = ['owner', 'admin'];

interface Login {
  username?: string;
  salt?: string;
  hash?: string;
}

export interface Member {
  id: string;
  username: string;
  name: string;
  salt: string;
  hash: string;
  perms: Perm[];
  active: boolean;
  ver: number;
}

interface AuthFile {
  secret: string;
  users?: Partial<Record<Main | 'editor', Login>>;
  vers?: Partial<Record<Main | 'editor', number>>;
  members?: Member[];
  // Single-login format from before roles existed; treated as the admin login.
  salt?: string;
  hash?: string;
  username?: string;
  ver?: number;
}

/** Env fallbacks until a login is changed from the dashboard. */
const ENV: Record<Main, { user: string; pw: string; defaultUser: string; name: string }> = {
  owner: { user: 'SUPERADMIN_USERNAME', pw: 'SUPERADMIN_PASSWORD', defaultUser: 'owner', name: 'Owner' },
  admin: { user: 'ADMIN_USERNAME', pw: 'ADMIN_PASSWORD', defaultUser: 'admin', name: 'Admin' },
};

const normUser = (u: string) => u.trim().toLowerCase();
const sameText = (a: string, b: string) =>
  crypto.timingSafeEqual(crypto.createHash('sha256').update(a).digest(), crypto.createHash('sha256').update(b).digest());

// When storage can't persist the generated secret (Vercel before Blob is connected), a random one would
// change on every request and no login would stick, so derive a stable one from the env passwords instead.
const fallbackSecret = () => {
  const seed = (process.env.SUPERADMIN_PASSWORD || '') + (process.env.ADMIN_PASSWORD || '');
  return seed ? crypto.createHash('sha256').update(`session-secret:${seed}`).digest('hex') : crypto.randomBytes(32).toString('hex');
};

const readAuth = () => readDoc<AuthFile>('auth', () => ({ secret: fallbackSecret() }));
const key = async () => new TextEncoder().encode(process.env.SESSION_SECRET || (await readAuth()).secret);
const hashPw = (pw: string, salt: string) => crypto.scryptSync(pw, salt, 64);
const verifyHash = (pw: string, salt: string, hash: string) => {
  const want = Buffer.from(hash, 'hex');
  const got = hashPw(pw, salt);
  return got.length === want.length && crypto.timingSafeEqual(got, want);
};

// The admin login was called "editor" briefly; older data may still use that key.
const stored = (a: AuthFile, role: Main): Login =>
  a.users?.[role] || (role === 'admin' ? a.users?.editor || (a.hash ? { username: a.username, salt: a.salt, hash: a.hash } : {}) : {});
const version = (a: AuthFile, role: Main) => a.vers?.[role] ?? (role === 'admin' ? (a.vers?.editor ?? a.ver ?? 0) : 0);
const envPw = (role: Main) => process.env[ENV[role].pw] || '';
const configured = (a: AuthFile, role: Main) => Boolean(stored(a, role).hash || envPw(role));
const mainUsername = (a: AuthFile, role: Main) => stored(a, role).username || normUser(process.env[ENV[role].user] || ENV[role].defaultUser);

function mainPasswordMatches(a: AuthFile, role: Main, pw: string) {
  const s = stored(a, role);
  if (s.hash && s.salt) return verifyHash(pw, s.salt, s.hash);
  const env = envPw(role);
  return env ? sameText(pw, env) : false;
}

const mainSession = (a: AuthFile, role: Main): Session => ({ id: role, role, username: mainUsername(a, role), name: ENV[role].name, perms: [...PERM_IDS] });
const memberSession = (m: Member): Session => ({ id: m.id, role: 'member', username: m.username, name: m.name || m.username, perms: m.perms });

/** Every login ID in use, so a new one can't clash. */
function takenIds(a: AuthFile, except?: string) {
  const ids: string[] = [];
  for (const r of MAINS) if (configured(a, r) && r !== except) ids.push(mainUsername(a, r));
  for (const m of a.members || []) if (m.id !== except) ids.push(m.username);
  return ids;
}

export async function hasPassword() {
  const a = await readAuth();
  return MAINS.some((r) => configured(a, r));
}

export async function isConfigured(role: Main) {
  return configured(await readAuth(), role);
}

/** A first owner login can be created from the login page only in development. */
export const canSetupFromUi = () => process.env.NODE_ENV !== 'production';

export async function usernameFor(role: Main) {
  return mainUsername(await readAuth(), role);
}

/** Returns the matching user's session, or null. */
export async function checkLogin(username: string, pw: string): Promise<Session | null> {
  const a = await readAuth();
  const id = normUser(username);
  for (const role of MAINS) {
    if (configured(a, role) && sameText(id, mainUsername(a, role)) && mainPasswordMatches(a, role, pw)) return mainSession(a, role);
  }
  const m = (a.members || []).find((x) => x.active && x.username === id);
  return m && verifyHash(pw, m.salt, m.hash) ? memberSession(m) : null;
}

export async function checkOwnPassword(s: Session, pw: string) {
  const a = await readAuth();
  if (s.role !== 'member') return mainPasswordMatches(a, s.role, pw);
  const m = (a.members || []).find((x) => x.id === s.id);
  return Boolean(m && verifyHash(pw, m.salt, m.hash));
}

function bump(a: AuthFile, role: Main) {
  a.vers = { owner: version(a, 'owner'), admin: version(a, 'admin'), [role]: version(a, role) + 1 };
}

/** Saves the owner's or admin's login and signs that account out everywhere. */
export async function setLogin(role: Main, pw: string, username?: string) {
  const a = await readAuth();
  const id = username !== undefined && normUser(username) ? normUser(username) : mainUsername(a, role);
  if (takenIds(a, role).includes(id)) throw new Error('That login ID is already used by another account.');
  const salt = crypto.randomBytes(16).toString('hex');
  a.users = { ...a.users, [role]: { username: id, salt, hash: hashPw(pw, salt).toString('hex') } };
  if (role === 'admin') {
    delete a.users.editor;
    delete a.hash;
    delete a.salt;
    delete a.username;
  }
  bump(a, role);
  await writeDoc('auth', a);
}

/** Changes a team member's own login. */
export async function setMemberLogin(id: string, pw: string, username?: string) {
  const a = await readAuth();
  const m = (a.members || []).find((x) => x.id === id);
  if (!m) throw new Error('Account not found.');
  const uid = username !== undefined && normUser(username) ? normUser(username) : m.username;
  if (takenIds(a, id).includes(uid)) throw new Error('That login ID is already used by another account.');
  m.username = uid;
  m.salt = crypto.randomBytes(16).toString('hex');
  m.hash = hashPw(pw, m.salt).toString('hex');
  m.ver += 1;
  await writeDoc('auth', a);
}

/* ---------- team members ---------- */

export type MemberView = Omit<Member, 'salt' | 'hash' | 'ver'>;

export async function listMembers(): Promise<MemberView[]> {
  return ((await readAuth()).members || []).map(({ salt: _s, hash: _h, ver: _v, ...m }) => m);
}

const cleanPerms = (perms: string[]) => PERM_IDS.filter((p) => perms.includes(p));

export async function saveMember(input: { id?: string; username: string; name: string; password?: string; perms: string[]; active: boolean }) {
  const a = await readAuth();
  a.members = a.members || [];
  const username = normUser(input.username);
  if (!/^[a-z0-9._-]{3,32}$/.test(username)) throw new Error('Login ID: 3–32 letters, numbers, dots, dashes or underscores.');
  if (takenIds(a, input.id).includes(username)) throw new Error('That login ID is already used by another account.');
  const perms = cleanPerms(input.perms);
  if (!perms.length) throw new Error('Tick at least one section this person can manage.');
  let m = input.id ? a.members.find((x) => x.id === input.id) : undefined;
  if (!m) {
    if (!input.password || input.password.length < 8) throw new Error('Password: at least 8 characters.');
    m = { id: newId(), username, name: '', salt: '', hash: '', perms, active: true, ver: 0 };
    a.members.push(m);
  }
  const accessChanged = m.username !== username || m.perms.join() !== perms.join() || m.active !== input.active;
  m.username = username;
  m.name = input.name.trim().slice(0, 60);
  m.perms = perms;
  m.active = input.active;
  if (input.password) {
    if (input.password.length < 8) throw new Error('Password: at least 8 characters.');
    m.salt = crypto.randomBytes(16).toString('hex');
    m.hash = hashPw(input.password, m.salt).toString('hex');
  }
  // Sign the member out when their access or password changes, so new limits apply at once.
  if (accessChanged || input.password) m.ver += 1;
  await writeDoc('auth', a);
  return m.id;
}

export async function deleteMember(id: string) {
  const a = await readAuth();
  a.members = (a.members || []).filter((m) => m.id !== id);
  await writeDoc('auth', a);
}

/* ---------- sessions ---------- */

export async function createSession(s: Session) {
  const a = await readAuth();
  const v = s.role === 'member' ? (a.members || []).find((m) => m.id === s.id)?.ver || 0 : version(a, s.role);
  const token = await new SignJWT({ sub: s.id, v })
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

/** The signed-in user, or null. Sessions end when that account's login or access changes. */
export async function getSession(): Promise<Session | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, await key());
    const a = await readAuth();
    const sub = String(payload.sub || '');
    if (sub === 'owner' || sub === 'admin') {
      return configured(a, sub) && payload.v === version(a, sub) ? mainSession(a, sub) : null;
    }
    const m = (a.members || []).find((x) => x.id === sub);
    return m && m.active && payload.v === m.ver ? memberSession(m) : null;
  } catch {
    return null;
  }
}

/* Page guards redirect; action guards throw so the dashboard shows the message. */

export async function requireSession(): Promise<Session> {
  const s = await getSession();
  if (!s) redirect('/admin/login');
  return s;
}

export async function requirePerm(perm: Perm) {
  const s = await requireSession();
  if (!can(s, perm)) redirect('/admin?denied=1');
  return s;
}

export async function requireManager() {
  const s = await requireSession();
  if (!isManager(s)) redirect('/admin?denied=1');
  return s;
}

export async function assertSession(): Promise<Session> {
  const s = await getSession();
  if (!s) throw new Error('Your session has expired. Please sign in again.');
  return s;
}

export async function assertPerm(perm: Perm) {
  const s = await assertSession();
  if (!can(s, perm)) throw new Error('Your login cannot change this section.');
  return s;
}

export async function assertManager() {
  const s = await assertSession();
  if (!isManager(s)) throw new Error('Only the admin can do this.');
  return s;
}

export async function assertOwner() {
  const s = await assertSession();
  if (s.role !== 'owner') throw new Error('Only the site owner can do this.');
  return s;
}

export async function assertCollection(col: string) {
  const s = await assertSession();
  if (!canEditCollection(s, col)) throw new Error('Your login cannot edit this section.');
  return s;
}
