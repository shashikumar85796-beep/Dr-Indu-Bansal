import type { MetadataRoute } from 'next';
import { absolute } from '@/lib/seo';
import { getContent } from '@/lib/store';

export const revalidate = 3600;

export default async function robots(): Promise<MetadataRoute.Robots> {
  const { settings } = await getContent();
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/admin', '/admin/'] }],
    sitemap: absolute(settings, '/sitemap.xml'),
  };
}
