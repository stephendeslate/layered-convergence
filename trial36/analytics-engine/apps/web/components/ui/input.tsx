import { type InputHTMLAttributes, forwardRef } from 'react';
import { cn } from './utils';

// TRACED: AE-UI-004
export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', ...props }, ref) => (
    <input
      type={type}
      className={cn(className)}
      ref={ref}
      style={{
        display: 'flex',
        height: '2.5rem',
        width: '100%',
        borderRadius: 'var(--radius)',
        border: '1px solid var(--input)',
        backgroundColor: 'transparent',
        padding: '0.5rem 0.75rem',
        fontSize: '0.875rem',
        color: 'var(--foreground)',
        outline: 'none',
      }}
      {...props}
    />
  ),
);
Input.displayName = 'Input';

export { Input };
