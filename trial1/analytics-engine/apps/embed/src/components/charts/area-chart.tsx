'use client';

import {
  AreaChart as RechartsAreaChart,
  Area,
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

export function EmbedAreaChart({ data, dimensionKey, metricKeys, height = 280, primaryColor, stacked }: Props) {
  const colors = primaryColor ? [primaryColor, ...COLORS.slice(1)] : COLORS;
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsAreaChart data={data} margin={{ top: 5, right: 15, left: 5, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--grid-color, #e5e7eb)" />
        <XAxis dataKey={dimensionKey} tick={{ fontSize: 11 }} stroke="var(--axis-color, #9ca3af)" />
        <YAxis tick={{ fontSize: 11 }} stroke="var(--axis-color, #9ca3af)" />
        <Tooltip contentStyle={{ fontSize: '12px', borderRadius: '6px' }} />
        {metricKeys.map((key, i) => (
          <Area
            key={key}
            type="monotone"
            dataKey={key}
            stroke={colors[i % colors.length]}
            fill={colors[i % colors.length]}
            fillOpacity={0.3}
            stackId={stacked ? 'stack' : undefined}
          />
        ))}
      </RechartsAreaChart>
    </ResponsiveContainer>
  );
}
