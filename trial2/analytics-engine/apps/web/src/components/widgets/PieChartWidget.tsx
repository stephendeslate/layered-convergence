'use client';

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface PieChartWidgetProps {
  data: Record<string, unknown>[];
  config: {
    metric: string;
    dimension: string;
    donut?: boolean;
  };
  title?: string;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

export function PieChartWidget({ data, config, title }: PieChartWidgetProps) {
  return (
    <div className="h-full w-full p-4">
      {title && <h3 className="text-sm font-semibold mb-2">{title}</h3>}
      <ResponsiveContainer width="100%" height="90%">
        <PieChart>
          <Pie
            data={data}
            dataKey={config.metric}
            nameKey={config.dimension}
            cx="50%"
            cy="50%"
            innerRadius={config.donut ? '60%' : 0}
            outerRadius="80%"
            paddingAngle={2}
            label
          >
            {data.map((_entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
