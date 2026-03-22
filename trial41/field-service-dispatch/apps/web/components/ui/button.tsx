'use client';

import * as React from 'react';
import { cn } from '../../lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

// TRACED: FD-BUTTON-COMPONENT
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    const variants: Record<string, string> = {
      default: 'bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90',
      destructive: 'bg-[var(--destructive)] text-[var(--destructive-foreground)] hover:opacity-90',
      outline: 'border border-[var(--border)] bg-[var(--background)] hover:bg-[var(--accent)]',
      secondary: 'bg-[var(--secondary)] text-[var(--secondary-foreground)] hover:opacity-80',
      ghost: 'hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)]',
      link: 'text-[var(--primary)] underline-offset-4 hover:underline',
    };

    const sizes: Record<string, string> = {
      default: 'h-10 px-4 py-2',
      sm: 'h-9 rounded-md px-3',
      lg: 'h-11 rounded-md px-8',
      icon: 'h-10 w-10',
    };

    return (
      <button
        className={cn(
          'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-[var(--background)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
          variants[variant],
          sizes[size],
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
