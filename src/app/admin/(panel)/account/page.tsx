import { PasswordForm } from '@/components/admin/PasswordForm';
import { logoutAction } from '../../actions';

export const metadata = { title: 'Account' };

export default function AccountPage() {
  return (
    <>
      <div className="a-top">
        <div>
          <h1>Account</h1>
          <p>Change the dashboard password. Changing it signs out every other device.</p>
        </div>
      </div>
      <div className="card" style={{ maxWidth: 520 }}>
        <PasswordForm />
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
