import 'server-only';
import type { FormCtx } from '@/components/admin/ItemForm';
import { getContent, listUploads } from '@/lib/store';
import { lines } from '@/lib/utils';

/** Data the editors need: the media library, dynamic select options and typing suggestions. */
export async function formContext(): Promise<FormCtx> {
  const [c, uploads] = await Promise.all([getContent(), listUploads()]);
  const uniq = (v: string[]) => [...new Set(v.filter(Boolean))];
  return {
    uploads: uploads.map(({ name, url, size }) => ({ name, url, size })),
    options: { galleryCategories: lines(c.settings.galleryCategories) },
    siteUrl: c.settings.siteUrl,
    suggestions: {
      category: uniq(c.stories.map((s) => s.category)),
      platform: uniq(['YouTube', 'YouTube Short', 'Facebook', 'Instagram Reel', ...c.videos.map((v) => v.platform)]),
      outlet: uniq(c.coverage.map((x) => x.outlet)),
    },
  };
}
