import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'destructive';
}

const Alert = forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="alert"
        className={cn(
          'relative rounded-lg border p-4',
          variant === 'default' && 'border-gray-200 bg-white text-gray-900',
          variant === 'destructive' && 'border-red-200 bg-red-50 text-red-900',
          className,
        )}
        {...props}
      />
    );
  },
);

Alert.displayName = 'Alert';

export { Alert };
