'use client';

import { cn } from '@/lib/utils';

interface KpiCardProps {
  title: string;
  value: string | number;
  prefix?: string;
  suffix?: string;
  change?: number;
  changeLabel?: string;
  height?: number;
}

export function KpiCardWidget({
  title,
  value,
  prefix = '',
  suffix = '',
  change,
  changeLabel = 'vs last period',
}: KpiCardProps) {
  const isPositive = change !== undefined && change >= 0;

  return (
    <div className="flex h-full flex-col justify-center p-2">
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p className="mt-2 text-3xl font-bold text-gray-900">
        {prefix}
        {typeof value === 'number' ? value.toLocaleString() : value}
        {suffix}
      </p>
      {change !== undefined && (
        <div className="mt-2 flex items-center gap-1">
          <span
            className={cn(
              'inline-flex items-center text-sm font-medium',
              isPositive ? 'text-emerald-600' : 'text-red-600',
            )}
          >
            <svg
              className={cn('mr-0.5 h-4 w-4', !isPositive && 'rotate-180')}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
            </svg>
            {Math.abs(change).toFixed(1)}%
          </span>
          <span className="text-xs text-gray-500">{changeLabel}</span>
        </div>
      )}
    </div>
  );
}
