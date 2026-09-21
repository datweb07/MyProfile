'use client';

import {useActionState} from 'react';
import {useFormStatus} from 'react-dom';
import {loginAction, type LoginState} from '@/app/admin/login/actions';

const initialState: LoginState = {error: ''};

function SubmitButton() {
  const {pending} = useFormStatus();
  return (
    <button className="blog-button blog-button-primary" type="submit" disabled={pending}>
      {pending ? 'Signing in…' : 'Sign in'}
    </button>
  );
}

export default function AdminLoginForm({nextPath}: {nextPath?: string}) {
  const [state, action] = useActionState(loginAction, initialState);

  return (
    <form action={action} className="admin-login-form">
      <input type="hidden" name="next" value={nextPath || '/admin/posts'} />
      <label>
        Email
        <input name="email" type="email" autoComplete="email" required />
      </label>
      <label>
        Password
        <input name="password" type="password" autoComplete="current-password" minLength={6} required />
      </label>
      {state.error ? <p className="admin-form-error" role="alert">{state.error}</p> : null}
      <SubmitButton />
    </form>
  );
}
