import { cn } from '@/lib/utils';
import { type HTMLAttributes } from 'react';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
        variant === 'default' && 'bg-black text-white',
        variant === 'secondary' && 'bg-gray-100 text-gray-800',
        variant === 'destructive' && 'bg-red-100 text-red-800',
        variant === 'outline' && 'border text-gray-700',
        className,
      )}
      {...props}
    />
  );
}

export { Badge };
