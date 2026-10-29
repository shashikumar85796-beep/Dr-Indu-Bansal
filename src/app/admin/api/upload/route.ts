import crypto from 'crypto';
import { getSession } from '@/lib/auth';
import { saveUpload } from '@/lib/store';

// Vercel rejects request bodies over 4.5 MB; the dashboard shrinks larger photos before sending.
const MAX = 10 * 1024 * 1024;

// Checked against the file's first bytes, not the browser-supplied type.
function sniff(b: Uint8Array): string | null {
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'jpg';
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return 'png';
  if (b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46) return 'gif';
  const ascii = String.fromCharCode(...b.slice(0, 12));
  if (ascii.startsWith('RIFF') && ascii.slice(8, 12) === 'WEBP') return 'webp';
  if (ascii.slice(4, 12) === 'ftypavif' || ascii.slice(4, 12) === 'ftypavis') return 'avif';
  return null;
}

export async function POST(req: Request) {
  if (!(await getSession())) return Response.json({ error: 'Please sign in again.' }, { status: 401 });
  const origin = req.headers.get('origin');
  if (origin && new URL(origin).host !== req.headers.get('host')) return Response.json({ error: 'Bad origin.' }, { status: 403 });

  const form = await req.formData();
  const files = form.getAll('file').filter((f): f is File => f instanceof File);
  if (!files.length) return Response.json({ error: 'No file received.' }, { status: 400 });

  const saved: { name: string; url: string }[] = [];
  const errors: string[] = [];
  for (const file of files) {
    if (file.size > MAX) {
      errors.push(`${file.name}: larger than 10 MB`);
      continue;
    }
    const buf = new Uint8Array(await file.arrayBuffer());
    const ext = sniff(buf);
    if (!ext) {
      errors.push(`${file.name}: not a JPG, PNG, WebP, GIF or AVIF image`);
      continue;
    }
    const base = file.name.replace(/\.[^.]*$/, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'image';
    const name = `${base}-${crypto.randomBytes(4).toString('hex')}.${ext}`;
    try {
      saved.push({ name, url: await saveUpload(name, buf, `image/${ext === 'jpg' ? 'jpeg' : ext}`) });
    } catch (e) {
      errors.push(e instanceof Error ? e.message : 'Upload failed.');
    }
  }
  return Response.json({ saved, errors }, { status: saved.length ? 200 : 400 });
}
