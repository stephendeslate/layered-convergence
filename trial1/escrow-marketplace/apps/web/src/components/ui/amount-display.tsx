'use client';

import { formatCents } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface AmountDisplayProps {
  cents: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function AmountDisplay({ cents, className, size = 'md' }: AmountDisplayProps) {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-2xl font-bold',
  };

  return (
    <span className={cn('font-mono tabular-nums', sizeClasses[size], className)}>
      {formatCents(cents)}
    </span>
  );
}
