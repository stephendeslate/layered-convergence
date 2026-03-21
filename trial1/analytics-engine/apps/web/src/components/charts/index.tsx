'use client';

import dynamic from 'next/dynamic';

export const LineChart = dynamic(
  () => import('./line-chart').then((m) => ({ default: m.LineChartWidget })),
  { ssr: false, loading: () => <ChartSkeleton /> },
);

export const BarChart = dynamic(
  () => import('./bar-chart').then((m) => ({ default: m.BarChartWidget })),
  { ssr: false, loading: () => <ChartSkeleton /> },
);

export const PieChart = dynamic(
  () => import('./pie-chart').then((m) => ({ default: m.PieChartWidget })),
  { ssr: false, loading: () => <ChartSkeleton /> },
);

export const AreaChart = dynamic(
  () => import('./area-chart').then((m) => ({ default: m.AreaChartWidget })),
  { ssr: false, loading: () => <ChartSkeleton /> },
);

export const KpiCard = dynamic(
  () => import('./kpi-card').then((m) => ({ default: m.KpiCardWidget })),
  { ssr: false, loading: () => <ChartSkeleton /> },
);

export const DataTable = dynamic(
  () => import('./data-table').then((m) => ({ default: m.DataTableWidget })),
  { ssr: false, loading: () => <ChartSkeleton /> },
);

export const FunnelChart = dynamic(
  () => import('./funnel-chart').then((m) => ({ default: m.FunnelChartWidget })),
  { ssr: false, loading: () => <ChartSkeleton /> },
);

function ChartSkeleton() {
  return (
    <div className="flex h-[300px] items-center justify-center rounded-md bg-gray-50">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
    </div>
  );
}
