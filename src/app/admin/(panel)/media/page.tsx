import { MediaLibrary } from '@/components/admin/MediaLibrary';
import { getContent, listUploads } from '@/lib/store';

export const metadata = { title: 'Media library' };

export default async function MediaPage() {
  const [uploads, c] = await Promise.all([listUploads(), getContent()]);
  const json = JSON.stringify(c);
  const files = uploads.map((u) => ({ ...u, used: json.includes(u.url) }));
  return (
    <>
      <div className="a-top">
        <div>
          <h1>Media library</h1>
          <p>Every image uploaded to the site. Images are resized and converted automatically for fast loading.</p>
        </div>
      </div>
      <MediaLibrary files={files} />
    </>
  );
}
