// TRACED: FD-UI-COMP-001 — Button component with variants
import * as React from 'react';
import { cn } from '../../lib/utils';

const buttonVariants = {
  default: 'bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90',
  destructive: 'bg-[var(--destructive)] text-[var(--destructive-foreground)] hover:opacity-90',
  outline: 'border border-[var(--border)] bg-transparent text-[var(--foreground)] hover:bg-[var(--accent)]',
  secondary: 'bg-[var(--secondary)] text-[var(--secondary-foreground)] hover:opacity-80',
  ghost: 'text-[var(--foreground)] hover:bg-[var(--accent)]',
  link: 'text-[var(--primary)] underline-offset-4 hover:underline',
};

const sizeVariants = {
  default: 'h-10 px-4 py-2',
  sm: 'h-8 px-3 text-xs',
  lg: 'h-12 px-6 text-base',
  icon: 'h-10 w-10',
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof buttonVariants;
  size?: keyof typeof sizeVariants;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button
        className={cn(
          'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] disabled:pointer-events-none disabled:opacity-50',
          buttonVariants[variant],
          sizeVariants[size],
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);

Button.displayName = 'Button';

export { Button, buttonVariants };
