import { EditorLoginForm, PasswordForm } from '@/components/admin/PasswordForm';
import { isConfigured, requireAdmin, usernameFor } from '@/lib/auth';
import { ROLE_LABEL } from '@/lib/roles';
import { logoutAction } from '../../actions';

export const metadata = { title: 'Account' };

export default async function AccountPage() {
  const role = await requireAdmin();
  const [username, editorName, editorSet] = await Promise.all([usernameFor(role), usernameFor('editor'), isConfigured('editor')]);
  return (
    <>
      <div className="a-top">
        <div>
          <h1>Account</h1>
          <p>
            Signed in as <b>{username}</b> ({ROLE_LABEL[role]}). Changing your login signs out your other devices.
          </p>
        </div>
      </div>
      <div className="grid2" style={{ alignItems: 'start' }}>
        <div className="card">
          <PasswordForm username={username} />
        </div>
        {role === 'owner' ? (
          <div className="card">
            <h2>Editor login</h2>
            <p className="muted small" style={{ margin: '6px 0 14px' }}>
              The editor can publish news, press coverage, photos, videos, achievements and partner logos, and read the inbox. Site settings, the Sangh
              pages, page sections and backups stay with you.
              {editorSet ? ` Current editor ID: ${editorName}.` : ' No editor login is set yet.'}
            </p>
            <EditorLoginForm username={editorSet ? editorName : ''} />
          </div>
        ) : null}
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
