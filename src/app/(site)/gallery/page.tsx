import type { Metadata } from 'next';
import { Connect, PageHead, Sec } from '@/components/site/blocks';
import { GalleryGrid } from '@/components/site/GalleryGrid';
import { getContent } from '@/lib/store';
import { lines, visible } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Gallery',
  description: 'Photos from events, press meets, ceremonies and field work of Dr. Indu Bansal and Shramjeevi Patrakar Sangh Haryana.',
  alternates: { canonical: '/gallery' },
};

export default async function Gallery() {
  const c = await getContent();
  return (
    <>
      <PageHead title="Gallery" sub={c.settings.galleryIntro} />
      <Sec>
        <GalleryGrid items={visible(c.gallery)} categories={lines(c.settings.galleryCategories)} full />
      </Sec>
      <Connect s={c.settings} />
    </>
  );
}
