'use client';

import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];

interface Props {
  data: Record<string, unknown>[];
  nameKey: string;
  valueKey: string;
  height?: number;
  innerRadius?: number;
}

export function EmbedPieChart({ data, nameKey, valueKey, height = 280, innerRadius = 0 }: Props) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsPieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={innerRadius}
          outerRadius={90}
          paddingAngle={2}
          dataKey={valueKey}
          nameKey={nameKey}
          label={({ name, percent }: { name: string; percent: number }) => `${name} ${(percent * 100).toFixed(0)}%`}
          labelLine={false}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip contentStyle={{ fontSize: '12px', borderRadius: '6px' }} />
        <Legend wrapperStyle={{ fontSize: '11px' }} />
      </RechartsPieChart>
    </ResponsiveContainer>
  );
}
