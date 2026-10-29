import 'server-only';
import crypto from 'crypto';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SignJWT, jwtVerify } from 'jose';
import { canEdit, type Role } from './roles';
import { readDoc, writeDoc } from './store';

const COOKIE = 'admin_session';
const MAX_AGE = 7 * 24 * 3600;
const ROLES: Role[] = ['owner', 'editor'];

interface Login {
  username?: string;
  salt?: string;
  hash?: string;
}

interface AuthFile {
  secret: string;
  users?: Partial<Record<Role, Login>>;
  vers?: Partial<Record<Role, number>>;
  // Single-login format used before roles existed; treated as the editor login.
  salt?: string;
  hash?: string;
  username?: string;
  ver?: number;
}

/** Env fallbacks until a login is changed from the dashboard. */
const ENV: Record<Role, { user: string; pw: string; defaultUser: string }> = {
  owner: { user: 'SUPERADMIN_USERNAME', pw: 'SUPERADMIN_PASSWORD', defaultUser: 'owner' },
  editor: { user: 'ADMIN_USERNAME', pw: 'ADMIN_PASSWORD', defaultUser: 'admin' },
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

const stored = (a: AuthFile, role: Role): Login =>
  a.users?.[role] || (role === 'editor' && a.hash ? { username: a.username, salt: a.salt, hash: a.hash } : {});
const version = (a: AuthFile, role: Role) => a.vers?.[role] ?? (role === 'editor' ? a.ver || 0 : 0);
const envPw = (role: Role) => process.env[ENV[role].pw] || '';
const configured = (a: AuthFile, role: Role) => Boolean(stored(a, role).hash || envPw(role));

async function usernameOf(a: AuthFile, role: Role) {
  return stored(a, role).username || normUser(process.env[ENV[role].user] || ENV[role].defaultUser);
}

function passwordMatches(a: AuthFile, role: Role, pw: string) {
  const s = stored(a, role);
  if (s.hash && s.salt) {
    const want = Buffer.from(s.hash, 'hex');
    const got = hashPw(pw, s.salt);
    return got.length === want.length && crypto.timingSafeEqual(got, want);
  }
  const env = envPw(role);
  return env ? sameText(pw, env) : false;
}

export async function hasPassword() {
  const a = await readAuth();
  return ROLES.some((r) => configured(a, r));
}

export async function isConfigured(role: Role) {
  return configured(await readAuth(), role);
}

/** A first owner login can be created from the login page only in development. */
export const canSetupFromUi = () => process.env.NODE_ENV !== 'production';

export async function usernameFor(role: Role) {
  return usernameOf(await readAuth(), role);
}

/** Returns the role whose ID and password match, or null. */
export async function checkLogin(username: string, pw: string): Promise<Role | null> {
  const a = await readAuth();
  for (const role of ROLES) {
    if (!configured(a, role)) continue;
    if (sameText(normUser(username), await usernameOf(a, role)) && passwordMatches(a, role, pw)) return role;
  }
  return null;
}

export async function checkPasswordFor(role: Role, pw: string) {
  return passwordMatches(await readAuth(), role, pw);
}

/** Saves a role's login and signs out that role's other sessions. */
export async function setLogin(role: Role, pw: string, username?: string) {
  const a = await readAuth();
  const other = ROLES.find((r) => r !== role)!;
  const id = username !== undefined && normUser(username) ? normUser(username) : await usernameOf(a, role);
  if (configured(a, other) && id === (await usernameOf(a, other))) throw new Error('That login ID is already used by the other account.');
  const salt = crypto.randomBytes(16).toString('hex');
  a.users = { ...a.users, [role]: { username: id, salt, hash: hashPw(pw, salt).toString('hex') } };
  // Keep the legacy editor login from overriding the new one.
  if (role === 'editor') {
    delete a.hash;
    delete a.salt;
    delete a.username;
  }
  a.vers = { owner: version(a, 'owner'), editor: version(a, 'editor'), [role]: version(a, role) + 1 };
  await writeDoc('auth', a);
}

export async function createSession(role: Role) {
  const a = await readAuth();
  const token = await new SignJWT({ role, v: version(a, role) })
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

/** The signed-in role, or null. */
export async function getRole(): Promise<Role | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, await key());
    const role = payload.role as Role;
    if (!ROLES.includes(role)) return null;
    return payload.v === version(await readAuth(), role) ? role : null;
  } catch {
    return null;
  }
}

export async function isAdmin() {
  return (await getRole()) !== null;
}

/* Page guards redirect; action guards throw so the dashboard shows the message. */

export async function requireAdmin(): Promise<Role> {
  const role = await getRole();
  if (!role) redirect('/admin/login');
  return role;
}

export async function requireOwner() {
  if ((await requireAdmin()) !== 'owner') redirect('/admin?denied=1');
}

export async function assertRole(): Promise<Role> {
  const role = await getRole();
  if (!role) throw new Error('Your session has expired. Please sign in again.');
  return role;
}

export async function assertOwner() {
  if ((await assertRole()) !== 'owner') throw new Error('Only the site owner can change this.');
}

export async function assertCanEdit(col: string) {
  if (!canEdit(await assertRole(), col)) throw new Error('Your login cannot edit this section.');
}
