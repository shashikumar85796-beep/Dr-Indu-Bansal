'use client';

import { useRef, useState } from 'react';

export type Upload = { name: string; url: string; size: number };

const SHRINK_OVER = 3.5 * 1024 * 1024;
const MAX_SIDE = 2560;

/** Re-encodes large photos in the browser so uploads stay under the host's 4.5 MB request limit. */
async function shrink(file: File): Promise<File> {
  if (file.size <= SHRINK_OVER || file.type === 'image/gif') return file;
  try {
    const bmp = await createImageBitmap(file);
    const scale = Math.min(1, MAX_SIDE / Math.max(bmp.width, bmp.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bmp.width * scale);
    canvas.height = Math.round(bmp.height * scale);
    canvas.getContext('2d')!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, 'image/webp', 0.86));
    return blob && blob.size < file.size ? new File([blob], file.name.replace(/\.[^.]*$/, '.webp'), { type: 'image/webp' }) : file;
  } catch {
    return file;
  }
}

export async function uploadFiles(files: FileList | File[]) {
  // One request per file keeps each request small.
  const all = await Promise.all(Array.from(files).map(async (f) => uploadOne(await shrink(f))));
  return { saved: all.flatMap((r) => r.saved), errors: all.flatMap((r) => r.errors) };
}

async function uploadOne(file: File) {
  const fd = new FormData();
  fd.append('file', file);
  const res = await fetch('/admin/api/upload', { method: 'POST', body: fd });
  const data = (await res.json().catch(() => ({}))) as { saved?: { name: string; url: string }[]; errors?: string[]; error?: string };
  return { saved: data.saved || [], errors: data.errors || (data.error ? [data.error] : res.ok ? [] : ['Upload failed.']) };
}

export function MediaPicker({ uploads, onPick, onClose }: { uploads: Upload[]; onPick: (url: string) => void; onClose: () => void }) {
  return (
    <div className="modal" role="dialog" aria-modal="true" aria-label="Choose an image" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="box">
        <div className="hdr">
          <h2>Choose from library</h2>
          <button className="ib" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
        <div className="body">
          {uploads.length ? (
            <div className="mgrid">
              {uploads.map((u) => (
                <div className="mitem" key={u.name}>
                  <button className="pick" onClick={() => onPick(u.url)} aria-label={`Use ${u.name}`}>
                    <div className="im">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={u.url} alt="" loading="lazy" />
                    </div>
                  </button>
                  <div className="mi">
                    <span>{u.name}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="muted">No images uploaded yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export function ImageField({ id, value, onChange, uploads, onUploaded }: { id: string; value: string; onChange: (v: string) => void; uploads: Upload[]; onUploaded: (u: Upload) => void }) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [picking, setPicking] = useState(false);
  const [over, setOver] = useState(false);

  const send = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    setErr('');
    const { saved, errors } = await uploadFiles([files[0]]);
    setBusy(false);
    if (saved[0]) {
      onUploaded({ ...saved[0], size: files[0].size });
      onChange(saved[0].url);
    }
    if (errors.length) setErr(errors.join(' '));
  };

  return (
    <div
      className={`img-f${over ? ' drop' : ''}`}
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
      <div className="pv">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {value ? <img src={value} alt="" /> : 'No image'}
      </div>
      <div className="ctl">
        <div className="b">
          <button type="button" className="btn sm" onClick={() => input.current?.click()} disabled={busy}>
            {busy ? 'Uploading…' : 'Upload'}
          </button>
          <button type="button" className="btn sm ghost" onClick={() => setPicking(true)}>
            Library
          </button>
          {value ? (
            <button type="button" className="btn sm danger" onClick={() => onChange('')}>
              Remove
            </button>
          ) : null}
        </div>
        <input id={id} type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder="/uploads/… or https://…" />
        <span className="help">Drag a photo here, or paste an image link. JPG, PNG, WebP, GIF or AVIF up to 10 MB.</span>
        {err ? <span className="help" style={{ color: 'var(--red)' }}>{err}</span> : null}
        <input ref={input} type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/avif" hidden onChange={(e) => send(e.target.files)} />
      </div>
      {picking ? (
        <MediaPicker
          uploads={uploads}
          onClose={() => setPicking(false)}
          onPick={(u) => {
            onChange(u);
            setPicking(false);
          }}
        />
      ) : null}
    </div>
  );
}
