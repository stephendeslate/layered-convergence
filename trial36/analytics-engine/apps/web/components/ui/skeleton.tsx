import { type HTMLAttributes, forwardRef } from 'react';
import { cn } from './utils';

// TRACED: AE-UI-007
const Skeleton = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, style, ...props }, ref) => (
    <div
      className={cn(className)}
      ref={ref}
      aria-hidden="true"
      style={{
        backgroundColor: 'var(--muted)',
        borderRadius: 'var(--radius)',
        animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        ...style,
      }}
      {...props}
    />
  ),
);
Skeleton.displayName = 'Skeleton';

export { Skeleton };
