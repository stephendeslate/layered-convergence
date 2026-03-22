// TRACED: EM-UI-003 — Button component with variants
import * as React from 'react';
import { cn } from '../../lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';

    const variantStyles: Record<string, string> = {
      default: 'bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90',
      destructive: 'bg-[var(--destructive)] text-[var(--destructive-foreground)] hover:opacity-90',
      outline: 'border border-[var(--border)] bg-transparent hover:bg-[var(--accent)]',
      secondary: 'bg-[var(--secondary)] text-[var(--secondary-foreground)] hover:opacity-80',
      ghost: 'hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)]',
    };

    const sizeStyles: Record<string, string> = {
      default: 'h-10 px-4 py-2',
      sm: 'h-9 rounded-md px-3',
      lg: 'h-11 rounded-md px-8',
    };

    return (
      <button
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = 'Button';

export { Button };
