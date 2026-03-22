// TRACED:AE-PERF-13 — DashboardStats loaded via next/dynamic for bundle optimization

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const stats = [
  { label: 'Active Dashboards', value: '24' },
  { label: 'Running Pipelines', value: '7' },
  { label: 'Reports Generated', value: '156' },
  { label: 'Data Processed', value: '2.4 TB' },
];

export default function DashboardStats() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stat.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
