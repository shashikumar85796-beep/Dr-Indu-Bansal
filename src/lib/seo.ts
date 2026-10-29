import type { Settings } from './types';

const FALLBACK = 'https://indubansal.vercel.app';

/** The site's absolute base URL, from settings, then Vercel's production domain. */
export function siteBase(siteUrl?: string) {
  const candidates = [siteUrl, process.env.VERCEL_PROJECT_PRODUCTION_URL && `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`, FALLBACK];
  for (const c of candidates) {
    try {
      if (c) return new URL(c.endsWith('/') ? c : `${c}/`);
    } catch {}
  }
  return new URL(FALLBACK);
}

export const absolute = (s: Settings, path: string) => new URL(path, siteBase(s.siteUrl)).toString();

export const splitKeywords = (k?: string) =>
  (k || '')
    .split(/[,\n]/)
    .map((x) => x.trim())
    .filter(Boolean);

/** Parses dates like "26 Oct 2026" or "Oct 2026" to ISO; empty when not a real date. */
export function isoDate(text: string) {
  // Only full dates ("26 Oct 2026"); "Oct 2026" or "2025" would invent a day.
  if (!/\b\d{1,2}\s+[A-Za-z]{3,}\s+\d{4}\b/.test(text)) return '';
  // Read as a UTC calendar date so the server's timezone can't shift the day.
  const t = Date.parse(`${text.trim()} UTC`);
  return Number.isFinite(t) ? new Date(t).toISOString().slice(0, 10) : '';
}
