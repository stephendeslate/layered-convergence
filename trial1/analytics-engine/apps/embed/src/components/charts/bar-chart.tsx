'use client';

import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

interface Props {
  data: Record<string, unknown>[];
  dimensionKey: string;
  metricKeys: string[];
  height?: number;
  primaryColor?: string;
  stacked?: boolean;
}

export function EmbedBarChart({ data, dimensionKey, metricKeys, height = 280, primaryColor, stacked }: Props) {
  const colors = primaryColor ? [primaryColor, ...COLORS.slice(1)] : COLORS;
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsBarChart data={data} margin={{ top: 5, right: 15, left: 5, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--grid-color, #e5e7eb)" />
        <XAxis dataKey={dimensionKey} tick={{ fontSize: 11 }} stroke="var(--axis-color, #9ca3af)" />
        <YAxis tick={{ fontSize: 11 }} stroke="var(--axis-color, #9ca3af)" />
        <Tooltip contentStyle={{ fontSize: '12px', borderRadius: '6px' }} />
        {metricKeys.map((key, i) => (
          <Bar key={key} dataKey={key} fill={colors[i % colors.length]} radius={[3, 3, 0, 0]} stackId={stacked ? 'stack' : undefined} />
        ))}
      </RechartsBarChart>
    </ResponsiveContainer>
  );
}
