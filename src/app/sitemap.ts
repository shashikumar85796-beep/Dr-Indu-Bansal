import type { MetadataRoute } from 'next';
import { absolute, isoDate } from '@/lib/seo';
import { getContent } from '@/lib/store';
import { visible } from '@/lib/utils';

// Refreshed hourly so new updates appear without a redeploy.
export const revalidate = 3600;

const PAGES: [string, number, 'weekly' | 'monthly'][] = [
  ['/', 1, 'weekly'],
  ['/updates', 0.9, 'weekly'],
  ['/about', 0.8, 'monthly'],
  ['/sangh', 0.8, 'monthly'],
  ['/press', 0.7, 'weekly'],
  ['/media', 0.7, 'weekly'],
  ['/gallery', 0.6, 'weekly'],
  ['/awards', 0.6, 'monthly'],
  ['/join', 0.6, 'monthly'],
  ['/contact', 0.5, 'monthly'],
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const c = await getContent();
  const now = new Date();
  return [
    ...PAGES.map(([path, priority, changeFrequency]) => ({ url: absolute(c.settings, path), lastModified: now, changeFrequency, priority })),
    ...visible(c.stories).map((s) => ({
      url: absolute(c.settings, `/updates/${s.slug}`),
      lastModified: isoDate(s.date) || now,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
  ];
}
