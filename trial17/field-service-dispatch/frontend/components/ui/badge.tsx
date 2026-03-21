import { type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning';
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2',
        variant === 'default' && 'border-transparent bg-slate-900 text-slate-50',
        variant === 'secondary' && 'border-transparent bg-slate-100 text-slate-900',
        variant === 'destructive' && 'border-transparent bg-red-500 text-slate-50',
        variant === 'outline' && 'text-slate-950',
        variant === 'success' && 'border-transparent bg-green-500 text-white',
        variant === 'warning' && 'border-transparent bg-yellow-500 text-white',
        className,
      )}
      {...props}
    />
  );
}

export { Badge };
