'use client';

import { useActionState } from 'react';
import { loginAction } from '@/app/admin/actions';

export function LoginForm({ setup }: { setup: boolean }) {
  const [state, action, pending] = useActionState(loginAction, {});
  return (
    <form action={action}>
      <input type="password" name="password" placeholder="Password" aria-label="Password" autoComplete={setup ? 'new-password' : 'current-password'} autoFocus required />
      {setup ? <input type="password" name="confirm" placeholder="Repeat password" aria-label="Repeat password" autoComplete="new-password" required /> : null}
      <p className="err" role="alert">
        {state?.error}
      </p>
      <button className="btn" type="submit" disabled={pending} style={{ justifyContent: 'center' }}>
        {pending ? 'Please wait…' : setup ? 'Create password and sign in' : 'Sign in →'}
      </button>
    </form>
  );
}
