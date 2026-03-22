import { type ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from './utils';

// TRACED: AE-UI-001
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    const baseStyles: React.CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 'var(--radius)',
      fontWeight: 500,
      cursor: 'pointer',
      border: 'none',
      transition: 'opacity 0.2s',
    };

    const variantStyles: Record<string, React.CSSProperties> = {
      default: { backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' },
      destructive: { backgroundColor: 'var(--destructive)', color: 'var(--destructive-foreground)' },
      outline: { backgroundColor: 'transparent', border: '1px solid var(--border)', color: 'var(--foreground)' },
      ghost: { backgroundColor: 'transparent', color: 'var(--foreground)' },
    };

    const sizeStyles: Record<string, React.CSSProperties> = {
      default: { height: '2.5rem', padding: '0 1rem', fontSize: '0.875rem' },
      sm: { height: '2rem', padding: '0 0.75rem', fontSize: '0.8125rem' },
      lg: { height: '3rem', padding: '0 1.5rem', fontSize: '1rem' },
    };

    return (
      <button
        className={cn(className)}
        ref={ref}
        style={{ ...baseStyles, ...variantStyles[variant], ...sizeStyles[size] }}
        {...props}
      />
    );
  },
);
Button.displayName = 'Button';

export { Button };
