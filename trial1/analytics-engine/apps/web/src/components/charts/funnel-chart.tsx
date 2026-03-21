'use client';

import {
  FunnelChart as RechartsFunnelChart,
  Funnel,
  Tooltip,
  ResponsiveContainer,
  LabelList,
  Cell,
} from 'recharts';

const COLORS = ['#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe'];

interface FunnelChartProps {
  data: Record<string, unknown>[];
  nameKey: string;
  valueKey: string;
  height?: number;
  showPercentages?: boolean;
}

export function FunnelChartWidget({
  data,
  nameKey,
  valueKey,
  height = 300,
}: FunnelChartProps) {
  const funnelData = data.map((item, i) => ({
    name: String(item[nameKey] ?? ''),
    value: Number(item[valueKey] ?? 0),
    fill: COLORS[i % COLORS.length],
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsFunnelChart>
        <Tooltip
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            fontSize: '12px',
          }}
        />
        <Funnel dataKey="value" data={funnelData} isAnimationActive>
          {funnelData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
          <LabelList position="center" fill="#fff" stroke="none" fontSize={12} dataKey="name" />
        </Funnel>
      </RechartsFunnelChart>
    </ResponsiveContainer>
  );
}
