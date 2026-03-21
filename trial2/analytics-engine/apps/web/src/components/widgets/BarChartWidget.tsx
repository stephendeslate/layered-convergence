'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface BarChartWidgetProps {
  data: Record<string, unknown>[];
  config: {
    metric: string;
    dimension: string;
    orientation?: 'vertical' | 'horizontal';
  };
  title?: string;
}

export function BarChartWidget({ data, config, title }: BarChartWidgetProps) {
  const isHorizontal = config.orientation === 'horizontal';

  return (
    <div className="h-full w-full p-4">
      {title && <h3 className="text-sm font-semibold mb-2">{title}</h3>}
      <ResponsiveContainer width="100%" height="90%">
        <BarChart data={data} layout={isHorizontal ? 'vertical' : 'horizontal'}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--analytics-border)" />
          {isHorizontal ? (
            <>
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis type="category" dataKey={config.dimension} tick={{ fontSize: 12 }} />
            </>
          ) : (
            <>
              <XAxis dataKey={config.dimension} tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
            </>
          )}
          <Tooltip />
          <Legend />
          <Bar
            dataKey={config.metric}
            fill="var(--analytics-chart-1, #3b82f6)"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
