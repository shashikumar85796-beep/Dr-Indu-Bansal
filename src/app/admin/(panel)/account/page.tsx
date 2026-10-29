import Link from 'next/link';
import { AdminLoginForm, PasswordForm } from '@/components/admin/PasswordForm';
import { isConfigured, requireSession, usernameFor } from '@/lib/auth';
import { PERMS, ROLE_LABEL, isManager } from '@/lib/roles';
import { logoutAction } from '../../actions';

export const metadata = { title: 'My account' };

export default async function AccountPage() {
  const s = await requireSession();
  const [adminName, adminSet] = await Promise.all([usernameFor('admin'), isConfigured('admin')]);
  return (
    <>
      <div className="a-top">
        <div>
          <h1>My account</h1>
          <p>
            Signed in as <b>{s.username}</b> ({ROLE_LABEL[s.role]}). Changing your login signs out your other devices.
          </p>
        </div>
      </div>
      <div className="grid2" style={{ alignItems: 'start' }}>
        <div className="card">
          <PasswordForm username={s.username} />
        </div>
        <div className="card">
          {s.role === 'owner' ? (
            <>
              <h2>Admin login</h2>
              <p className="muted small" style={{ margin: '6px 0 14px' }}>
                The admin has full control of the website and can add team members. {adminSet ? `Current admin ID: ${adminName}.` : 'No admin login is set yet.'}
              </p>
              <AdminLoginForm username={adminSet ? adminName : ''} />
            </>
          ) : (
            <>
              <h2>Your access</h2>
              {isManager(s) ? (
                <p className="muted" style={{ marginTop: 8 }}>
                  You can manage every part of the website.{' '}
                  <Link href="/admin/team" style={{ color: 'var(--red)' }}>
                    Add team members
                  </Link>{' '}
                  to share the work.
                </p>
              ) : (
                <ul className="perm-list">
                  {PERMS.filter((p) => s.perms.includes(p.id)).map((p) => (
                    <li key={p.id}>✓ {p.label}</li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
      </div>
      <div className="card" style={{ maxWidth: 520, marginTop: 16 }}>
        <h2>Sign out</h2>
        <p className="muted" style={{ margin: '6px 0 14px' }}>
          End your session on this device.
        </p>
        <form action={logoutAction}>
          <button className="btn ghost">Sign out</button>
        </form>
      </div>
    </>
  );
}
