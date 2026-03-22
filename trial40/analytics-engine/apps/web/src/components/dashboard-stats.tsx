// TRACED:AE-PERF-09 — DashboardStats loaded via next/dynamic for bundle optimization
'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { formatBytes } from '@analytics-engine/shared';

interface DashboardStatsProps {
  eventCount: number;
  dashboardCount: number;
  pipelineCount: number;
  dataSize: number;
}

export default function DashboardStats({
  eventCount,
  dashboardCount,
  pipelineCount,
  dataSize,
}: DashboardStatsProps): React.ReactElement {
  const stats = [
    { label: 'Events', value: eventCount.toLocaleString() },
    { label: 'Dashboards', value: dashboardCount.toLocaleString() },
    { label: 'Pipelines', value: pipelineCount.toLocaleString() },
    { label: 'Data Processed', value: formatBytes(dataSize) },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-[var(--muted-foreground)]">
              {stat.label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
