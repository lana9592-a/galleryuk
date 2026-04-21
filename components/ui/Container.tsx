import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export type ContainerProps = {
  children: ReactNode;
  className?: string;
  as?: 'div' | 'section' | 'main' | 'header' | 'footer';
};

export function Container({ children, className, as: Tag = 'div' }: ContainerProps) {
  return <Tag className={cn('container mx-auto', className)}>{children}</Tag>;
}
