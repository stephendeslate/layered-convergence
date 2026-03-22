import { type HTMLAttributes } from 'react';
import { cn } from './utils';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors',
        variant === 'default' && 'bg-blue-100 text-blue-800',
        variant === 'secondary' && 'bg-gray-100 text-gray-800',
        variant === 'destructive' && 'bg-red-100 text-red-800',
        variant === 'outline' && 'border border-gray-300 text-gray-600',
        className,
      )}
      {...props}
    />
  );
}

export { Badge };
