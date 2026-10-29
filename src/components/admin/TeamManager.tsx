'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { removeTeamMember, saveTeamMember } from '@/app/admin/actions';
import { useToast } from './useToast';

type Member = { id: string; username: string; name: string; perms: string[]; active: boolean };
type Perm = { id: string; label: string };

function MemberForm({ perms, member, onDone }: { perms: Perm[]; member?: Member; onDone: () => void }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [picked, setPicked] = useState<string[]>(member?.perms || []);
  const [toast, toastNode] = useToast();

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = e.currentTarget;
    const v = (n: string) => (f.elements.namedItem(n) as HTMLInputElement).value;
    setBusy(true);
    setErr('');
    const r = await saveTeamMember({
      id: member?.id,
      name: v('name'),
      username: v('username'),
      password: v('password') || undefined,
      perms: picked,
      active: (f.elements.namedItem('active') as HTMLInputElement).checked,
    });
    setBusy(false);
    if (!r.ok) return setErr(r.error);
    toast(r.message || 'Saved.');
    router.refresh();
    onDone();
  };

  return (
    <form className="form tm-form" onSubmit={submit} noValidate>
      <div className="fgrid">
        <div className="fld">
          <label htmlFor="tm-name">Name</label>
          <input id="tm-name" name="name" type="text" defaultValue={member?.name} placeholder="e.g. Ravi (news desk)" />
        </div>
        <div className="fld">
          <label htmlFor="tm-user">Login ID</label>
          <input id="tm-user" name="username" type="text" defaultValue={member?.username} autoCapitalize="none" spellCheck={false} placeholder="ravi" />
        </div>
        <div className="fld">
          <label htmlFor="tm-pw">{member ? 'New password (leave empty to keep)' : 'Password'}</label>
          <input id="tm-pw" name="password" type="password" autoComplete="new-password" minLength={8} />
          <span className="help">At least 8 characters. Share it privately.</span>
        </div>
        <div className="fld">
          <span className="lbl">Status</span>
          <label className="sw">
            <input type="checkbox" name="active" defaultChecked={member ? member.active : true} /> Login allowed
          </label>
        </div>
        <div className="fld wide">
          <span className="lbl">Can manage</span>
          <div className="perm-grid">
            {perms.map((p) => (
              <label key={p.id} className={`perm${picked.includes(p.id) ? ' on' : ''}`}>
                <input
                  type="checkbox"
                  checked={picked.includes(p.id)}
                  onChange={(e) => setPicked((l) => (e.target.checked ? [...l, p.id] : l.filter((x) => x !== p.id)))}
                />
                {p.label}
              </label>
            ))}
          </div>
        </div>
      </div>
      {err ? <p className="err-line">{err}</p> : null}
      <div style={{ display: 'flex', gap: 8 }}>
        <button className="btn" disabled={busy}>
          {busy ? 'Saving…' : member ? 'Save changes' : 'Add team member'}
        </button>
        <button type="button" className="btn ghost" onClick={onDone}>
          Cancel
        </button>
      </div>
      {toastNode}
    </form>
  );
}

export function TeamManager({ members, perms }: { members: Member[]; perms: Perm[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<string | null>(null);
  const [toast, toastNode] = useToast();
  const label = (id: string) => perms.find((p) => p.id === id)?.label || id;

  return (
    <>
      <div className="card">
        <div className="a-top" style={{ marginBottom: editing === 'new' ? 16 : 0 }}>
          <h2>Team members ({members.length})</h2>
          {editing !== 'new' ? (
            <button className="btn" onClick={() => setEditing('new')}>
              + Add team member
            </button>
          ) : null}
        </div>
        {editing === 'new' ? <MemberForm perms={perms} onDone={() => setEditing(null)} /> : null}
      </div>

      {members.length ? (
        <div className="list" style={{ marginTop: 16 }}>
          {members.map((m) => (
            <div key={m.id} className={`card tm${m.active ? '' : ' off'}`}>
              {editing === m.id ? (
                <MemberForm perms={perms} member={m} onDone={() => setEditing(null)} />
              ) : (
                <div className="tm-row">
                  <span className="a-av">{(m.name || m.username).slice(0, 1).toUpperCase()}</span>
                  <div className="tm-info">
                    <b>{m.name || m.username}</b>
                    <span className="muted small">
                      Login ID: {m.username} · {m.active ? 'Active' : 'Paused'}
                    </span>
                    <div className="chips-a">
                      {m.perms.map((p) => (
                        <span key={p} className="pill">
                          {label(p)}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="tm-acts">
                    <button className="btn sm ghost" onClick={() => setEditing(m.id)}>
                      Edit
                    </button>
                    <button
                      className="btn sm danger"
                      onClick={async () => {
                        if (!confirm(`Remove ${m.name || m.username}? They will be signed out and lose access.`)) return;
                        const r = await removeTeamMember(m.id);
                        toast(r.ok ? r.message || 'Removed.' : r.error, !r.ok);
                        router.refresh();
                      }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="muted" style={{ marginTop: 16 }}>
          No team members yet. The admin and owner always have full access.
        </p>
      )}
      {toastNode}
    </>
  );
}
