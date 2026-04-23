import { forwardRef } from 'react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Size = 'sm' | 'md' | 'lg';
type Variant = 'ghost' | 'solid';

export type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon: ReactNode;
  label: string;
  variant?: Variant;
  size?: Size;
};

const sizeClass: Record<Size, string> = {
  sm: 'h-8 w-8 p-[6px] md:p-[4px]',
  md: 'h-10 w-10 p-2',
  lg: 'h-12 w-12 p-[10px]',
};

const variantClass: Record<Variant, string> = {
  ghost: 'text-text hover:bg-surface-muted',
  solid: 'bg-surface text-text border border-border-strong hover:bg-surface-muted',
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, label, variant = 'ghost', size = 'md', className, ...rest }, ref) => (
    <button
      ref={ref}
      type="button"
      aria-label={label}
      className={cn(
        'inline-flex items-center justify-center rounded-full transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-bg',
        'disabled:cursor-not-allowed disabled:opacity-50',
        sizeClass[size],
        variantClass[variant],
        className,
      )}
      {...rest}
    >
      {icon}
    </button>
  ),
);
IconButton.displayName = 'IconButton';
