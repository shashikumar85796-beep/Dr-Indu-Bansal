import crypto from 'crypto';
import { promises as fs } from 'fs';
import path from 'path';
import { isAdmin } from '@/lib/auth';
import { UPLOAD_DIR } from '@/lib/store';

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
  if (!(await isAdmin())) return Response.json({ error: 'Please sign in again.' }, { status: 401 });
  const origin = req.headers.get('origin');
  if (origin && new URL(origin).host !== req.headers.get('host')) return Response.json({ error: 'Bad origin.' }, { status: 403 });

  const form = await req.formData();
  const files = form.getAll('file').filter((f): f is File => f instanceof File);
  if (!files.length) return Response.json({ error: 'No file received.' }, { status: 400 });

  await fs.mkdir(UPLOAD_DIR, { recursive: true });
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
    const base = path.parse(file.name).name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'image';
    const name = `${base}-${crypto.randomBytes(4).toString('hex')}.${ext}`;
    await fs.writeFile(path.join(UPLOAD_DIR, name), buf);
    saved.push({ name, url: `/uploads/${name}` });
  }
  return Response.json({ saved, errors }, { status: saved.length ? 200 : 400 });
}
