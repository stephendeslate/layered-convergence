// TRACED: FD-UI-COMP-002 — Badge component with variant styles
import * as React from 'react';
import { cn } from '../../lib/utils';

const badgeVariants = {
  default: 'bg-[var(--primary)] text-[var(--primary-foreground)]',
  secondary: 'bg-[var(--secondary)] text-[var(--secondary-foreground)]',
  destructive: 'bg-[var(--destructive)] text-[var(--destructive-foreground)]',
  outline: 'border border-[var(--border)] text-[var(--foreground)]',
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: keyof typeof badgeVariants;
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors',
        badgeVariants[variant],
        className,
      )}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
