import { redirect } from 'next/navigation';
import { LoginForm } from '@/components/admin/LoginForm';
import { canSetupFromUi, hasPassword, isAdmin } from '@/lib/auth';

export const metadata = { title: 'Sign in' };

export default async function Login() {
  if (await isAdmin()) redirect('/admin');
  const setup = !(await hasPassword());
  return (
    <div className="login">
      <div className="card">
        <h1>{setup ? 'Create admin password' : 'Admin sign in'}</h1>
        {setup && !canSetupFromUi() ? (
          <p>No admin password is set. Add ADMIN_PASSWORD to the server environment and restart the site.</p>
        ) : (
          <>
            <p>{setup ? 'Choose a password for the site dashboard. You can change it later under Account.' : 'Manage every page of the website from one place.'}</p>
            <LoginForm setup={setup} />
          </>
        )}
      </div>
    </div>
  );
}
