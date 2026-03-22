import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from './utils';

export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'destructive';
}

const Alert = forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'relative w-full rounded-lg border p-4',
          variant === 'default' && 'bg-white text-gray-900 border-gray-200',
          variant === 'destructive' && 'bg-red-50 text-red-900 border-red-200',
          className,
        )}
        {...props}
      />
    );
  },
);

Alert.displayName = 'Alert';

export { Alert };
