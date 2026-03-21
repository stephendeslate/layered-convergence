'use client';

interface Props {
  title: string;
  value: string | number;
  prefix?: string;
  suffix?: string;
  change?: number;
  primaryColor?: string;
}

export function EmbedKpiCard({ title, value, prefix = '', suffix = '', change, primaryColor }: Props) {
  const isPositive = change !== undefined && change >= 0;
  return (
    <div className="flex h-full flex-col justify-center">
      <p className="text-sm font-medium" style={{ opacity: 0.6 }}>{title}</p>
      <p className="mt-1 text-3xl font-bold" style={{ color: primaryColor }}>
        {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
      </p>
      {change !== undefined && (
        <div className="mt-1 flex items-center gap-1 text-sm">
          <span style={{ color: isPositive ? '#10b981' : '#ef4444' }}>
            {isPositive ? '+' : ''}{change.toFixed(1)}%
          </span>
          <span style={{ opacity: 0.5, fontSize: '12px' }}>vs last period</span>
        </div>
      )}
    </div>
  );
}
