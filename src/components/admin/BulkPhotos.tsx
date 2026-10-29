'use client';

import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { addGalleryPhotos } from '@/app/admin/actions';
import { uploadFiles } from './ImageField';

/** Upload many photos at once; each becomes a gallery item in the chosen category. */
export function BulkPhotos({ categories }: { categories: string[] }) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [category, setCategory] = useState(categories[0] || '');
  const [busy, setBusy] = useState('');
  const [msg, setMsg] = useState<{ text: string; err?: boolean } | null>(null);
  const [over, setOver] = useState(false);

  const send = async (files: FileList | null) => {
    if (!files?.length) return;
    setMsg(null);
    setBusy(`Uploading ${files.length} photo${files.length === 1 ? '' : 's'}…`);
    const { saved, errors } = await uploadFiles(files);
    let text = '';
    if (saved.length) {
      setBusy('Adding to the gallery…');
      const r = await addGalleryPhotos(saved.map((s) => s.url), category);
      text = r.ok ? r.message || 'Added.' : r.error;
      if (r.ok) router.refresh();
    }
    if (errors.length) text = [text, `Not uploaded: ${errors.join(' · ')}`].filter(Boolean).join(' ');
    setBusy('');
    setMsg({ text, err: !saved.length });
    if (input.current) input.current.value = '';
  };

  return (
    <div
      className={`bulk${over ? ' on' : ''}`}
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        send(e.dataTransfer.files);
      }}
    >
      <div>
        <b>Add many photos at once</b>
        <span>Drag photos here or choose them. Each photo is added to the gallery; you can add captions afterwards.</span>
      </div>
      <div className="bulk-c">
        {categories.length ? (
          <select value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Category for these photos">
            {categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        ) : null}
        <button className="btn" type="button" onClick={() => input.current?.click()} disabled={!!busy}>
          {busy || 'Choose photos'}
        </button>
        <input ref={input} type="file" multiple accept="image/jpeg,image/png,image/webp,image/gif,image/avif" hidden onChange={(e) => send(e.target.files)} />
      </div>
      {msg ? (
        <p className="bulk-m" role="status" style={{ color: msg.err ? 'var(--red)' : '#1a9b4b' }}>
          {msg.text}
        </p>
      ) : null}
    </div>
  );
}
