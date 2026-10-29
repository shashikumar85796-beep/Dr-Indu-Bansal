'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ICONS, ICON_KEYS } from '@/lib/icons';
import type { Field } from '@/lib/schema';
import { ImageField, type Upload } from './ImageField';

type Values = Record<string, unknown>;
export type FormCtx = { uploads: Upload[]; options: Record<string, string[]>; suggestions: Record<string, string[]> };
type SaveResult = { ok: true; message?: string } | { ok: false; error: string };

function FieldInput({ f, value, set, ctx, onUploaded }: { f: Field; value: unknown; set: (v: unknown) => void; ctx: FormCtx; onUploaded: (u: Upload) => void }) {
  const id = `f-${f.key}`;
  const str = value == null ? '' : String(value);
  switch (f.type) {
    case 'bool':
      return (
        <label className="sw">
          <input id={id} type="checkbox" checked={!!value} onChange={(e) => set(e.target.checked)} />
          {f.label}
        </label>
      );
    case 'textarea':
    case 'paragraphs':
    case 'lines':
      return <textarea id={id} value={str} rows={f.type === 'paragraphs' ? 12 : f.type === 'lines' ? 6 : 3} onChange={(e) => set(e.target.value)} placeholder={f.placeholder} />;
    case 'select': {
      const opts = f.options || (f.optionsFrom ? ctx.options[f.optionsFrom] : []) || [];
      return (
        <select id={id} value={str} onChange={(e) => set(e.target.value)}>
          {!opts.includes(str) && str ? <option value={str}>{str}</option> : null}
          {opts.map((o) => (
            <option key={o} value={o}>
              {f.key === 'defaultFont' ? `${o} · ${{ A: 'Modern', B: 'Newsroom', C: 'Editorial' }[o] || ''}` : o}
            </option>
          ))}
        </select>
      );
    }
    case 'icon':
      return (
        <div className="icons" role="radiogroup" aria-label={f.label}>
          {ICON_KEYS.map((k) => (
            <button type="button" key={k} aria-pressed={str === k} aria-label={k} title={k} onClick={() => set(k)}>
              <svg viewBox="0 0 24 24" aria-hidden="true" dangerouslySetInnerHTML={{ __html: ICONS[k] }} />
            </button>
          ))}
        </div>
      );
    case 'image':
      return <ImageField id={id} value={str} onChange={set} uploads={ctx.uploads} onUploaded={onUploaded} />;
    case 'color':
      return (
        <div className="colr">
          <input type="color" value={/^#[0-9a-f]{6}$/i.test(str) ? str : '#d3141c'} onChange={(e) => set(e.target.value)} aria-label={f.label} />
          <input id={id} type="text" value={str} onChange={(e) => set(e.target.value)} style={{ maxWidth: 140 }} />
        </div>
      );
    case 'number':
      return <input id={id} type="number" min={0} max={99} value={str} onChange={(e) => set(e.target.value)} />;
    default: {
      const list = f.suggest ? ctx.suggestions[f.key] : undefined;
      return (
        <>
          <input
            id={id}
            type="text"
            inputMode={f.type === 'digits' ? 'numeric' : f.type === 'url' ? 'url' : undefined}
            value={str}
            onChange={(e) => set(e.target.value)}
            placeholder={f.placeholder}
            list={list ? `${id}-list` : undefined}
          />
          {list ? (
            <datalist id={`${id}-list`}>
              {list.map((o) => (
                <option key={o} value={o} />
              ))}
            </datalist>
          ) : null}
        </>
      );
    }
  }
}

/** Schema-driven editor used for site settings and every content list. */
export function ItemForm({
  groups,
  initial,
  ctx,
  onSave,
  extraActions,
  saveLabel = 'Save changes',
}: {
  groups: { id: string; title: string; fields: Field[] }[];
  initial: Values;
  ctx: FormCtx;
  onSave: (v: Values) => Promise<SaveResult>;
  extraActions?: ReactNode;
  saveLabel?: string;
}) {
  const [values, setValues] = useState<Values>(initial);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<{ text: string; kind?: 'ok' | 'err' }>({ text: '' });
  const [bad, setBad] = useState<string[]>([]);
  const [uploads, setUploads] = useState(ctx.uploads);
  const form = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    addEventListener('beforeunload', warn);
    return () => removeEventListener('beforeunload', warn);
  }, [dirty]);

  const save = async () => {
    const missing = groups.flatMap((g) => g.fields).filter((f) => f.required && !String(values[f.key] ?? '').trim());
    setBad(missing.map((f) => f.key));
    if (missing.length) {
      setStatus({ text: `Please fill: ${missing.map((f) => f.label).join(', ')}`, kind: 'err' });
      document.getElementById(`f-${missing[0].key}`)?.focus();
      return;
    }
    setBusy(true);
    setStatus({ text: 'Saving…' });
    const r = await onSave(values).catch((e: Error) => ({ ok: false as const, error: e.message }));
    setBusy(false);
    if (r.ok) {
      setDirty(false);
      setStatus({ text: r.message || `Saved at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}. The website is updated.`, kind: 'ok' });
    } else setStatus({ text: r.error, kind: 'err' });
  };

  // Ctrl/Cmd + S saves.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        form.current?.requestSubmit();
      }
    };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  });

  const local: FormCtx = { ...ctx, uploads };

  return (
    <form
      ref={form}
      className="form"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        if (!busy) save();
      }}
    >
      {groups.map((g) => (
        <div className="fset" id={g.id} key={g.id}>
          {g.title ? <h2>{g.title}</h2> : null}
          <div className="fgrid">
            {g.fields.map((f) => (
              <div key={f.key} className={`fld${f.wide || f.type === 'image' || f.type === 'icon' ? ' wide' : ''}`}>
                {f.type !== 'bool' ? (
                  f.type === 'icon' ? (
                    <span className="lbl">{f.label}</span>
                  ) : (
                    <label htmlFor={`f-${f.key}`}>
                      {f.label}
                      {f.required ? <span className="req"> *</span> : null}
                    </label>
                  )
                ) : null}
                <div className={bad.includes(f.key) ? 'bad-wrap' : undefined} style={{ display: 'contents' }}>
                  <FieldInput
                    f={f}
                    value={values[f.key]}
                    ctx={local}
                    onUploaded={(u) => setUploads((l) => [u, ...l])}
                    set={(v) => {
                      setValues((o) => ({ ...o, [f.key]: v }));
                      setDirty(true);
                      if (bad.includes(f.key)) setBad((b) => b.filter((k) => k !== f.key));
                    }}
                  />
                </div>
                {f.help || f.type === 'paragraphs' ? <span className="help">{f.help || 'Leave a blank line between paragraphs.'}</span> : null}
              </div>
            ))}
          </div>
        </div>
      ))}
      <div className="savebar">
        <span className={`st${status.kind ? ` ${status.kind}` : ''}`} role="status">
          {status.text || (dirty ? 'You have unsaved changes.' : 'No changes yet.')}
        </span>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {extraActions}
          <button className="btn" type="submit" disabled={busy}>
            {busy ? 'Saving…' : saveLabel}
          </button>
        </div>
      </div>
    </form>
  );
}
