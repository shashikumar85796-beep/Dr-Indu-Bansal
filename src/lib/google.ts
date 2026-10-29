import 'server-only';
import { SignJWT, importPKCS8 } from 'jose';

/*
 * Reads Google Analytics 4 and Search Console data with a Google Cloud service account.
 * Credentials come only from server env vars: GOOGLE_CLIENT_EMAIL and GOOGLE_PRIVATE_KEY.
 * The service account must be added as a Viewer on the GA4 property and as a user on the
 * Search Console property.
 */

const SCOPES = ['https://www.googleapis.com/auth/analytics.readonly', 'https://www.googleapis.com/auth/webmasters.readonly'].join(' ');
const CACHE_MS = 30 * 60_000;

export const serviceAccountEmail = () => process.env.GOOGLE_CLIENT_EMAIL || '';
export const hasServiceAccount = () => Boolean(process.env.GOOGLE_CLIENT_EMAIL && process.env.GOOGLE_PRIVATE_KEY);

let token: { value: string; expires: number } | null = null;

async function accessToken() {
  if (token && token.expires > Date.now() + 60_000) return token.value;
  const email = process.env.GOOGLE_CLIENT_EMAIL!;
  // Env vars usually store the key with literal "\n" sequences.
  const pem = process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, '\n');
  const key = await importPKCS8(pem, 'RS256');
  const assertion = await new SignJWT({ scope: SCOPES })
    .setProtectedHeader({ alg: 'RS256', typ: 'JWT' })
    .setIssuer(email)
    .setSubject(email)
    .setAudience('https://oauth2.googleapis.com/token')
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(key);
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion }),
    cache: 'no-store',
  });
  const data = (await res.json()) as { access_token?: string; expires_in?: number; error_description?: string; error?: string };
  if (!res.ok || !data.access_token) throw new Error(`Google sign-in failed: ${data.error_description || data.error || res.status}`);
  token = { value: data.access_token, expires: Date.now() + (data.expires_in || 3600) * 1000 };
  return token.value;
}

async function post<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { authorization: `Bearer ${await accessToken()}`, 'content-type': 'application/json' },
    body: JSON.stringify(body),
    cache: 'no-store',
  });
  const data = (await res.json().catch(() => ({}))) as T & { error?: { message?: string } };
  if (!res.ok) throw new Error(data.error?.message || `Google returned ${res.status}`);
  return data;
}

const cache = new Map<string, { at: number; value: unknown }>();
async function cached<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < CACHE_MS) return hit.value as T;
  const value = await fn();
  cache.set(key, { at: Date.now(), value });
  return value;
}

/* ---------- Google Analytics 4 ---------- */

type GaRow = { dimensionValues?: { value: string }[]; metricValues?: { value: string }[] };
type GaReport = { rows?: GaRow[] };

export interface Ga4Data {
  totals: { users: number; sessions: number; views: number; engagement: number; prevUsers: number; prevViews: number };
  daily: { date: string; users: number; views: number }[];
  pages: { label: string; value: number }[];
  channels: { label: string; value: number }[];
  devices: { label: string; value: number }[];
  cities: { label: string; value: number }[];
}

const num = (v?: string) => Number(v || 0);
const list = (r: GaReport): { label: string; value: number }[] =>
  (r.rows || []).map((row) => ({ label: row.dimensionValues?.[0]?.value || '(not set)', value: num(row.metricValues?.[0]?.value) }));

export function ga4Report(propertyId: string, days: number): Promise<Ga4Data> {
  return cached(`ga4:${propertyId}:${days}`, async () => {
    const url = `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:batchRunReports`;
    const range = { startDate: `${days}daysAgo`, endDate: 'today' };
    const prev = { startDate: `${days * 2}daysAgo`, endDate: `${days + 1}daysAgo` };
    const top = (dimension: string, metric: string, limit: number) => ({
      dateRanges: [range],
      dimensions: [{ name: dimension }],
      metrics: [{ name: metric }],
      orderBys: [{ metric: { metricName: metric }, desc: true }],
      limit,
    });
    const { reports = [] } = await post<{ reports?: GaReport[] }>(url, {
      requests: [
        {
          dateRanges: [range, prev],
          metrics: [{ name: 'activeUsers' }, { name: 'sessions' }, { name: 'screenPageViews' }, { name: 'userEngagementDuration' }],
        },
        {
          dateRanges: [range],
          dimensions: [{ name: 'date' }],
          metrics: [{ name: 'activeUsers' }, { name: 'screenPageViews' }],
          orderBys: [{ dimension: { dimensionName: 'date' } }],
        },
        top('pagePath', 'screenPageViews', 10),
        top('sessionDefaultChannelGroup', 'sessions', 8),
        top('deviceCategory', 'activeUsers', 5),
      ],
    });
    // With two date ranges, GA adds a dateRange dimension: "date_range_0" (current) and "date_range_1" (previous).
    const totalsRows = reports[0]?.rows || [];
    const pick = (i: string) => totalsRows.find((r) => r.dimensionValues?.[0]?.value === i)?.metricValues || [];
    const cur = pick('date_range_0');
    const before = pick('date_range_1');
    const cities = await post<GaReport>(url.replace(':batchRunReports', ':runReport'), top('city', 'activeUsers', 8));
    return {
      totals: {
        users: num(cur[0]?.value),
        sessions: num(cur[1]?.value),
        views: num(cur[2]?.value),
        engagement: num(cur[3]?.value),
        prevUsers: num(before[0]?.value),
        prevViews: num(before[2]?.value),
      },
      daily: (reports[1]?.rows || []).map((r) => {
        const d = r.dimensionValues?.[0]?.value || '';
        return { date: `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}`, users: num(r.metricValues?.[0]?.value), views: num(r.metricValues?.[1]?.value) };
      }),
      pages: list(reports[2] || {}),
      channels: list(reports[3] || {}),
      devices: list(reports[4] || {}),
      cities: list(cities),
    };
  });
}

/* ---------- Search Console ---------- */

type ScRow = { keys?: string[]; clicks: number; impressions: number; ctr: number; position: number };

export interface SearchData {
  totals: { clicks: number; impressions: number; ctr: number; position: number };
  daily: { date: string; clicks: number; impressions: number }[];
  queries: ScRow[];
  pages: ScRow[];
}

const ymd = (d: Date) => d.toISOString().slice(0, 10);

export function searchReport(property: string, days: number): Promise<SearchData> {
  return cached(`gsc:${property}:${days}`, async () => {
    const url = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(property)}/searchAnalytics/query`;
    // Search Console data lags by about two days.
    const end = new Date(Date.now() - 2 * 86_400_000);
    const start = new Date(end.getTime() - (days - 1) * 86_400_000);
    const base = { startDate: ymd(start), endDate: ymd(end) };
    const [all, daily, queries, pages] = await Promise.all([
      post<{ rows?: ScRow[] }>(url, base),
      post<{ rows?: ScRow[] }>(url, { ...base, dimensions: ['date'] }),
      post<{ rows?: ScRow[] }>(url, { ...base, dimensions: ['query'], rowLimit: 10 }),
      post<{ rows?: ScRow[] }>(url, { ...base, dimensions: ['page'], rowLimit: 10 }),
    ]);
    const t = all.rows?.[0];
    return {
      totals: { clicks: t?.clicks || 0, impressions: t?.impressions || 0, ctr: t?.ctr || 0, position: t?.position || 0 },
      daily: (daily.rows || []).map((r) => ({ date: r.keys?.[0] || '', clicks: r.clicks, impressions: r.impressions })),
      queries: queries.rows || [],
      pages: pages.rows || [],
    };
  });
}
