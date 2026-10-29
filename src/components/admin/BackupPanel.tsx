'use client';

import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { importContent } from '@/app/admin/actions';
import { useToast } from './useToast';

export function BackupPanel() {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [toast, toastNode] = useToast();

  const restore = async (file?: File) => {
    if (!file) return;
    if (!confirm(`Replace all website content with “${file.name}”? Download a backup of the current content first if you may need it.`)) return;
    setBusy(true);
    const r = await importContent(await file.text());
    setBusy(false);
    if (input.current) input.current.value = '';
    toast(r.ok ? r.message || 'Restored.' : r.error, !r.ok);
    if (r.ok) router.refresh();
  };

  return (
    <>
      <div className="card">
        <h2>Download</h2>
        <p className="muted" style={{ margin: '6px 0 14px' }}>
          A JSON file with every setting, update, video, photo entry and list on the site.
        </p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <a className="btn" href="/admin/api/export?type=content">
            Download content backup
          </a>
          <a className="btn ghost" href="/admin/api/export?type=submissions">
            Download inbox (CSV)
          </a>
        </div>
      </div>
      <div className="card">
        <h2>Restore</h2>
        <p className="muted" style={{ margin: '6px 0 14px' }}>
          Upload a content backup to replace everything on the site. Inbox messages are kept.
        </p>
        <button className="btn danger" onClick={() => input.current?.click()} disabled={busy}>
          {busy ? 'Restoring…' : 'Choose backup file'}
        </button>
        <input ref={input} type="file" accept="application/json,.json" hidden onChange={(e) => restore(e.target.files?.[0])} />
      </div>
      {toastNode}
    </>
  );
}
