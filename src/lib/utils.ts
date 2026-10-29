export const lines = (s: string | undefined) =>
  (s || '').split('\n').map((l) => l.trim()).filter(Boolean);

export const paragraphs = (s: string | undefined) =>
  (s || '').split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);

export const visible = <T extends { published: boolean }>(items: T[]) => items.filter((i) => i.published);

export const newId = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

export function slugify(s: string) {
  return (
    s
      .normalize('NFKD')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 70)
      .replace(/-+$/, '') || 'update'
  );
}

export const isNumeric = (v: string) => /^\d+$/.test(v.trim());

export const waLink = (number: string, text: string) =>
  `https://wa.me/${number.replace(/\D/g, '')}${text ? `?text=${encodeURIComponent(text)}` : ''}`;

export const isExternal = (href: string) => /^https?:\/\//i.test(href);

/** YouTube video id from watch, youtu.be, shorts or embed links. */
export const youtubeId = (url: string) =>
  url.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{11})/)?.[1] || '';

/** A video's thumbnail: the uploaded one, else YouTube's own. */
export const videoThumb = (v: { image: string; url: string }) => {
  const id = v.image ? '' : youtubeId(v.url);
  return v.image || (id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : '');
};
