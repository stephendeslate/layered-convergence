import { type HTMLAttributes, forwardRef } from 'react';
import { cn } from './utils';

// TRACED: AE-UI-006
export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'destructive';
}

const Alert = forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    const variantStyles: Record<string, React.CSSProperties> = {
      default: {
        backgroundColor: 'var(--muted)',
        color: 'var(--foreground)',
        border: '1px solid var(--border)',
      },
      destructive: {
        backgroundColor: 'var(--destructive)',
        color: 'var(--destructive-foreground)',
        border: '1px solid var(--destructive)',
      },
    };

    return (
      <div
        className={cn(className)}
        ref={ref}
        role="alert"
        style={{
          borderRadius: 'var(--radius)',
          padding: '1rem',
          fontSize: '0.875rem',
          ...variantStyles[variant],
        }}
        {...props}
      />
    );
  },
);
Alert.displayName = 'Alert';

export { Alert };
