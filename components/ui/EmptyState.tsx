import type { ReactNode } from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import { Button } from './Button';
import { cn } from '@/lib/utils';

const linkAsButton = cn(
  'inline-flex h-10 items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold transition-colors',
  'bg-primary text-white hover:bg-primary-hover',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-bg',
);

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: { label: string; href?: Route; onClick?: () => void };
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {icon ? (
        <div className="mb-4 text-text-muted" aria-hidden>
          {icon}
        </div>
      ) : null}
      <h2 className="text-xl font-semibold">{title}</h2>
      {description ? (
        <p className="mt-2 max-w-prose text-text-muted">{description}</p>
      ) : null}
      {action ? (
        <div className="mt-6">
          {action.href ? (
            <Link href={action.href} className={linkAsButton}>
              {action.label}
            </Link>
          ) : (
            <Button onClick={action.onClick}>{action.label}</Button>
          )}
        </div>
      ) : null}
    </div>
  );
}
