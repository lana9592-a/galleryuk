import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function Container({
  children,
  className,
  as: Tag = 'div',
}: {
  children: ReactNode;
  className?: string;
  as?: 'div' | 'section' | 'main' | 'header' | 'footer';
}) {
  return <Tag className={cn('container mx-auto', className)}>{children}</Tag>;
}
