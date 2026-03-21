'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface AreaChartWidgetProps {
  data: Record<string, unknown>[];
  config: {
    metrics: string[];
    dimension: string;
    stacked?: boolean;
  };
  title?: string;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export function AreaChartWidget({ data, config, title }: AreaChartWidgetProps) {
  return (
    <div className="h-full w-full p-4">
      {title && <h3 className="text-sm font-semibold mb-2">{title}</h3>}
      <ResponsiveContainer width="100%" height="90%">
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--analytics-border)" />
          <XAxis dataKey={config.dimension} tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Legend />
          {config.metrics.map((metric, i) => (
            <Area
              key={metric}
              type="monotone"
              dataKey={metric}
              stackId={config.stacked ? 'stack' : undefined}
              stroke={COLORS[i % COLORS.length]}
              fill={COLORS[i % COLORS.length]}
              fillOpacity={0.3}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
