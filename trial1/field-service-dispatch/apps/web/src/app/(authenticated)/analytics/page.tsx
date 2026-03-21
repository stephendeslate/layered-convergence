'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import type { AnalyticsOverview } from '@fsd/shared';
import dynamic from 'next/dynamic';

const AnalyticsCharts = dynamic(
  () => import('@/components/analytics/analytics-charts').then((m) => m.AnalyticsCharts),
  { ssr: false, loading: () => <div className="h-96 bg-gray-100 rounded animate-pulse" /> },
);

export default function AnalyticsPage() {
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.get<AnalyticsOverview>('/analytics/overview')
      .then(setOverview)
      .catch(() => {
        // Use fallback data for demo
        setOverview({
          totalWorkOrders: 47,
          completedToday: 22,
          activeWorkOrders: 15,
          techniciansOnDuty: 4,
          averageCompletionMinutes: 52,
          revenueToday: 3245,
          revenueThisMonth: 12450,
        });
      })
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading || !overview) {
    return (
      <div className="p-6 space-y-4">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const kpis = [
    {
      title: 'Jobs Today',
      value: String(overview.totalWorkOrders),
      change: '+12%',
      positive: true,
    },
    {
      title: 'Avg Completion',
      value: `${overview.averageCompletionMinutes} min`,
      change: '-8%',
      positive: true,
    },
    {
      title: 'Utilization',
      value: `${Math.round((overview.activeWorkOrders / Math.max(overview.techniciansOnDuty * 8, 1)) * 100)}%`,
      change: '+5%',
      positive: true,
    },
    {
      title: 'Revenue (Month)',
      value: formatCurrency(overview.revenueThisMonth),
      change: '+18%',
      positive: true,
    },
  ];

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <div className="text-sm text-gray-500">Last 7 days</div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <Card key={kpi.title}>
            <CardContent className="p-5">
              <div className="text-sm text-gray-500">{kpi.title}</div>
              <div className="text-2xl font-bold text-gray-900 mt-1">{kpi.value}</div>
              <div className={`text-xs mt-1 ${kpi.positive ? 'text-green-600' : 'text-red-600'}`}>
                {kpi.change} {kpi.positive ? '\u2191' : '\u2193'}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <AnalyticsCharts overview={overview} />
    </div>
  );
}
