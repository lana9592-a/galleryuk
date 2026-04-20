import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Tone = 'neutral' | 'primary' | 'success' | 'warning' | 'info';

export function Badge({
  children,
  tone = 'neutral',
  className,
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2 py-[2px] text-xs font-medium',
        tone === 'neutral' && 'border-border bg-surface text-text-muted',
        tone === 'primary' && 'border-primary/20 bg-primary-soft text-primary',
        tone === 'success' && 'border-success/20 bg-success/10 text-success',
        tone === 'warning' && 'border-warning/20 bg-warning/10 text-warning',
        tone === 'info' && 'border-accent/20 bg-accent/10 text-accent',
        className,
      )}
    >
      {children}
    </span>
  );
}
