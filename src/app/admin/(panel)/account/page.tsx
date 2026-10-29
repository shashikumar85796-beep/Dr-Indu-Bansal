import { PasswordForm } from '@/components/admin/PasswordForm';
import { adminUsername } from '@/lib/auth';
import { logoutAction } from '../../actions';

export const metadata = { title: 'Account' };

export default async function AccountPage() {
  const username = await adminUsername();
  return (
    <>
      <div className="a-top">
        <div>
          <h1>Account</h1>
          <p>Change the dashboard login ID and password. Changing them signs out every other device.</p>
        </div>
      </div>
      <div className="card" style={{ maxWidth: 520 }}>
        <PasswordForm username={username} />
      </div>
      <div className="card" style={{ maxWidth: 520 }}>
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
