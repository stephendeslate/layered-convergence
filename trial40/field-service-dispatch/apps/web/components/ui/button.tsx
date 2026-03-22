import { cn } from '@/lib/utils';
import { type ButtonHTMLAttributes, forwardRef } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
}

const variantStyles: Record<string, string> = {
  default: 'bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90',
  destructive: 'bg-[var(--destructive)] text-[var(--destructive-foreground)] hover:opacity-90',
  outline: 'border border-[var(--input)] bg-transparent hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)]',
  secondary: 'bg-[var(--secondary)] text-[var(--secondary-foreground)] hover:opacity-80',
  ghost: 'hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)]',
};

const sizeStyles: Record<string, string> = {
  default: 'h-10 px-4 py-2',
  sm: 'h-9 px-3 text-sm',
  lg: 'h-11 px-8',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center rounded-[var(--radius)] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] disabled:pointer-events-none disabled:opacity-50',
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
      {...props}
    />
  ),
);

Button.displayName = 'Button';
