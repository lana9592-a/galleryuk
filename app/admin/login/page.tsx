import type { Metadata } from 'next';
import { LoginForm } from './LoginForm';

export const metadata: Metadata = {
  title: 'Admin sign in',
  robots: { index: false, follow: false },
};

type Search = { sent?: string };

export default function AdminLoginPage({
  searchParams,
}: {
  searchParams: Search;
}) {
  const sent = searchParams.sent === '1';

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-10">
      <div className="space-y-6 rounded-lg border border-border bg-surface p-6 shadow-sm">
        <header className="space-y-1">
          <h1 className="font-serif text-2xl font-bold">GalleryUK admin</h1>
          <p className="text-sm text-text-muted">
            Sign in with the magic link sent to your email.
          </p>
        </header>

        {sent ? (
          <div
            role="status"
            className="rounded-md border border-border bg-surface-muted p-4 text-sm"
          >
            <p className="font-medium">Check your email.</p>
            <p className="mt-1 text-text-muted">
              If the address you entered is registered as the admin, a one-time
              link is on its way. The link expires in about an hour.
            </p>
          </div>
        ) : (
          <LoginForm />
        )}
      </div>
    </main>
  );
}
