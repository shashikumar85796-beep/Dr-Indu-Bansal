'use client';

import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { deleteUpload } from '@/app/admin/actions';
import { uploadFiles } from './ImageField';
import { useToast } from './useToast';

type F = { name: string; url: string; size: number; used: boolean };

const kb = (n: number) => (n > 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.round(n / 1024)} KB`);

export function MediaLibrary({ files }: { files: F[] }) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const [busy, setBusy] = useState(false);
  const [toast, toastNode] = useToast();

  const send = async (list: FileList | null) => {
    if (!list?.length) return;
    setBusy(true);
    const { saved, errors } = await uploadFiles(list);
    setBusy(false);
    if (errors.length) toast(errors.join(' · '), true);
    else toast(`${saved.length} image${saved.length === 1 ? '' : 's'} uploaded.`);
    router.refresh();
  };

  return (
    <>
      <div
        className={`dz${over ? ' on' : ''}`}
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
        <p style={{ marginBottom: 10 }}>Drag photos here to upload several at once</p>
        <button className="btn" onClick={() => input.current?.click()} disabled={busy}>
          {busy ? 'Uploading…' : 'Choose photos'}
        </button>
        <input ref={input} type="file" multiple accept="image/jpeg,image/png,image/webp,image/gif,image/avif" hidden onChange={(e) => send(e.target.files)} />
      </div>
      {files.length ? (
        <div className="mgrid">
          {files.map((f) => (
            <div className="mitem" key={f.name}>
              <a className="im" href={f.url} target="_blank" rel="noopener" style={{ display: 'block' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={f.url} alt={f.name} loading="lazy" />
              </a>
              <div className="mi">
                <span title={f.name}>{f.name}</span>
                <span>
                  {kb(f.size)} · {f.used ? <b style={{ color: '#1a9b4b' }}>In use</b> : 'Not used'}
                </span>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    className="btn sm ghost"
                    onClick={async () => {
                      await navigator.clipboard?.writeText(f.url).catch(() => {});
                      toast('Link copied.');
                    }}
                  >
                    Copy link
                  </button>
                  <button
                    className="ib del"
                    aria-label="Delete"
                    title="Delete"
                    onClick={async () => {
                      const warn = f.used ? 'This image is used on the website and will disappear from those pages. ' : '';
                      if (!confirm(`${warn}Delete ${f.name}?`)) return;
                      const r = await deleteUpload(f.name);
                      if (!r.ok) toast(r.error, true);
                      router.refresh();
                    }}
                  >
                    🗑
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card muted">No images uploaded yet.</div>
      )}
      {toastNode}
    </>
  );
}
