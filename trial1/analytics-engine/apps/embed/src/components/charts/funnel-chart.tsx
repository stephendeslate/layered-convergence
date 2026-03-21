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

interface Props {
  data: Record<string, unknown>[];
  nameKey: string;
  valueKey: string;
  height?: number;
}

export function EmbedFunnelChart({ data, nameKey, valueKey, height = 280 }: Props) {
  const funnelData = data.map((item, i) => ({
    name: String(item[nameKey] ?? ''),
    value: Number(item[valueKey] ?? 0),
    fill: COLORS[i % COLORS.length],
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsFunnelChart>
        <Tooltip contentStyle={{ fontSize: '12px', borderRadius: '6px' }} />
        <Funnel dataKey="value" data={funnelData} isAnimationActive>
          {funnelData.map((entry, index) => (
            <Cell key={index} fill={entry.fill} />
          ))}
          <LabelList position="center" fill="#fff" stroke="none" fontSize={11} dataKey="name" />
        </Funnel>
      </RechartsFunnelChart>
    </ResponsiveContainer>
  );
}
