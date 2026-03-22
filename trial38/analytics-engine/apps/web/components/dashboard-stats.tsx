// TRACED: AE-PERF-13
'use client';

import { Card, CardContent } from './ui/card';

interface DashboardStatsProps {
  count: number;
}

export default function DashboardStats({ count }: DashboardStatsProps) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 py-4">
        <span className="text-2xl font-bold">{count}</span>
        <span className="text-sm text-gray-600 dark:text-gray-400">
          Total Dashboards
        </span>
      </CardContent>
    </Card>
  );
}
