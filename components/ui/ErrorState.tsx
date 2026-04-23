'use client';

import { AlertTriangle, WifiOff, FileQuestion } from 'lucide-react';
import { Button } from './Button';

export type ErrorKind = '404' | '500' | 'offline' | 'generic';

export type ErrorStateProps = {
  kind?: ErrorKind;
  title: string;
  description?: string;
  onRetry?: () => void;
};

const iconFor: Record<ErrorKind, typeof AlertTriangle> = {
  '404': FileQuestion,
  '500': AlertTriangle,
  offline: WifiOff,
  generic: AlertTriangle,
};

export function ErrorState({
  kind = 'generic',
  title,
  description,
  onRetry,
}: ErrorStateProps) {
  const Icon = iconFor[kind];
  return (
    <div role="alert" className="flex flex-col items-center justify-center py-16 text-center">
      <Icon aria-hidden className="mb-4 h-10 w-10 text-text-muted" />
      <h2 className="text-xl font-semibold">{title}</h2>
      {description ? (
        <p className="mt-2 max-w-prose text-text-muted">{description}</p>
      ) : null}
      {onRetry ? (
        <div className="mt-6">
          <Button variant="secondary" onClick={onRetry}>
            Try again
          </Button>
        </div>
      ) : null}
    </div>
  );
}
