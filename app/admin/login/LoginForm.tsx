'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { sendMagicLink, type SendLinkState } from './actions';

const initial: SendLinkState = { status: 'idle' };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-11 w-full items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-white transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:opacity-60"
    >
      {pending ? 'Sending…' : 'Send magic link'}
    </button>
  );
}

export function LoginForm() {
  const [state, formAction] = useFormState(sendMagicLink, initial);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-1">
        <label htmlFor="email" className="block text-sm font-medium">
          Email address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          maxLength={120}
          className="h-11 w-full rounded-md border border-border bg-surface px-3 text-base outline-none focus:border-text"
        />
      </div>
      {state.status === 'error' ? (
        <p role="alert" className="text-sm text-red-700">
          {state.message}
        </p>
      ) : null}
      <SubmitButton />
    </form>
  );
}
