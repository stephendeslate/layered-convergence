import { type HTMLAttributes, forwardRef } from 'react';
import { cn } from './utils';

// TRACED: AE-UI-002
export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', style, ...props }, ref) => {
    const baseStyles: React.CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      borderRadius: '9999px',
      padding: '0.125rem 0.625rem',
      fontSize: '0.75rem',
      fontWeight: 600,
      lineHeight: '1.25rem',
    };

    const variantStyles: Record<string, React.CSSProperties> = {
      default: { backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' },
      secondary: { backgroundColor: 'var(--secondary)', color: 'var(--secondary-foreground)' },
      destructive: { backgroundColor: 'var(--destructive)', color: 'var(--destructive-foreground)' },
      outline: { backgroundColor: 'transparent', border: '1px solid var(--border)', color: 'var(--foreground)' },
    };

    return (
      <span
        className={cn(className)}
        ref={ref}
        style={{ ...baseStyles, ...variantStyles[variant], ...style }}
        {...props}
      />
    );
  },
);
Badge.displayName = 'Badge';

export { Badge };
