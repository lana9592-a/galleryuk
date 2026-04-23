import type { Metadata } from 'next';
import { WifiOff } from 'lucide-react';
import { Container } from '@/components/ui/Container';

export const metadata: Metadata = {
  title: 'Offline',
  description: 'You are currently offline.',
};

export default function OfflinePage() {
  return (
    <Container as="div" className="flex min-h-[60vh] items-center justify-center py-10">
      <div className="flex max-w-sm flex-col items-center text-center">
        <WifiOff className="mb-4 h-10 w-10 text-text-muted" aria-hidden />
        <h1 className="font-serif text-2xl font-bold">You&rsquo;re offline</h1>
        <p className="mt-2 text-text-muted">
          This page isn&rsquo;t available without a connection. Try again once you&rsquo;re
          back online.
        </p>
      </div>
    </Container>
  );
}
