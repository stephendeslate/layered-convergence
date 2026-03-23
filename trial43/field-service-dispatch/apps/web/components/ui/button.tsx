import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button
        className={cn(
          'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] disabled:pointer-events-none disabled:opacity-50',
          variant === 'default' &&
            'bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90',
          variant === 'destructive' &&
            'bg-[var(--destructive)] text-[var(--destructive-foreground)] hover:opacity-90',
          variant === 'outline' &&
            'border border-[var(--border)] bg-[var(--background)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)]',
          variant === 'secondary' &&
            'bg-[var(--secondary)] text-[var(--secondary-foreground)] hover:opacity-80',
          variant === 'ghost' &&
            'hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)]',
          size === 'default' && 'h-10 px-4 py-2',
          size === 'sm' && 'h-9 px-3',
          size === 'lg' && 'h-11 px-8',
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = 'Button';

export { Button };
