import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
          variant === 'default' && 'bg-blue-100 text-blue-800',
          variant === 'secondary' && 'bg-gray-100 text-gray-800',
          variant === 'destructive' && 'bg-red-100 text-red-800',
          variant === 'outline' && 'border border-gray-300 text-gray-700',
          className,
        )}
        {...props}
      />
    );
  },
);

Badge.displayName = 'Badge';

export { Badge };
