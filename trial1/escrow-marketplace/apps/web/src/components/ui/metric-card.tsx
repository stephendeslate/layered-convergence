'use client';

import { cn } from '@/lib/utils';

interface MetricCardProps {
  label: string;
  value: string | number;
  trend?: { value: number; positive: boolean };
  icon?: React.ReactNode;
  className?: string;
}

export function MetricCard({ label, value, trend, icon, className }: MetricCardProps) {
  return (
    <div className={cn('rounded-xl border border-gray-200 bg-white p-6 shadow-sm', className)}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-500">{label}</p>
        {icon && <div className="text-gray-400">{icon}</div>}
      </div>
      <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
      {trend && (
        <div className="mt-2 flex items-center text-sm">
          <span className={trend.positive ? 'text-green-600' : 'text-red-600'}>
            {trend.positive ? '\u2191' : '\u2193'} {Math.abs(trend.value)}%
          </span>
          <span className="ml-1 text-gray-500">vs last period</span>
        </div>
      )}
    </div>
  );
}
