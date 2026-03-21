'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface LineChartWidgetProps {
  data: Record<string, unknown>[];
  config: {
    metric: string;
    dimension: string;
    additionalMetrics?: string[];
  };
  title?: string;
}

const COLORS = [
  'var(--analytics-chart-1, #3b82f6)',
  'var(--analytics-chart-2, #10b981)',
  'var(--analytics-chart-3, #f59e0b)',
  'var(--analytics-chart-4, #ef4444)',
  'var(--analytics-chart-5, #8b5cf6)',
];

export function LineChartWidget({ data, config, title }: LineChartWidgetProps) {
  const metrics = [config.metric, ...(config.additionalMetrics ?? [])];

  return (
    <div className="h-full w-full p-4">
      {title && <h3 className="text-sm font-semibold mb-2">{title}</h3>}
      <ResponsiveContainer width="100%" height="90%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--analytics-border)" />
          <XAxis dataKey={config.dimension} tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Legend />
          {metrics.map((metric, i) => (
            <Line
              key={metric}
              type="monotone"
              dataKey={metric}
              stroke={COLORS[i % COLORS.length]}
              strokeWidth={2}
              dot={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
