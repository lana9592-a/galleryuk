import Link from 'next/link';
import { Container } from '@/components/ui/Container';

export default function NotFound() {
  return (
    <Container as="div" className="flex min-h-[60vh] items-center justify-center py-10">
      <div className="max-w-md text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-text-muted">404</p>
        <h1 className="mt-2 font-serif text-3xl font-bold md:text-4xl">
          Page not found
        </h1>
        <p className="mt-3 text-text-muted">
          The page you&rsquo;re looking for doesn&rsquo;t exist or has been moved.
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex h-10 items-center justify-center rounded-md bg-text px-4 text-sm font-semibold text-white hover:bg-text/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
          >
            Go home
          </Link>
          <Link
            href="/exhibitions"
            className="inline-flex h-10 items-center justify-center rounded-md border border-border-strong bg-surface px-4 text-sm font-semibold text-text hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
          >
            Browse exhibitions
          </Link>
        </div>
      </div>
    </Container>
  );
}
