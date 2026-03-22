import { type LabelHTMLAttributes, forwardRef } from 'react';
import { cn } from './utils';

// TRACED: AE-UI-005
export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {}

const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, ...props }, ref) => (
    <label
      className={cn(className)}
      ref={ref}
      style={{
        fontSize: '0.875rem',
        fontWeight: 500,
        lineHeight: '1.25rem',
        color: 'var(--foreground)',
      }}
      {...props}
    />
  ),
);
Label.displayName = 'Label';

export { Label };
