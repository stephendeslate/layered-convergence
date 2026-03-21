'use client';

import dynamic from 'next/dynamic';

function ChartSkeleton() {
  return (
    <div className="flex items-center justify-center" style={{ height: 280 }}>
      <div
        style={{
          width: 24,
          height: 24,
          border: '2px solid #e5e7eb',
          borderTopColor: '#6b7280',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }}
      />
    </div>
  );
}

export const EmbedLineChart = dynamic(
  () => import('./line-chart').then(m => ({ default: m.EmbedLineChart })),
  { ssr: false, loading: () => <ChartSkeleton /> },
);

export const EmbedBarChart = dynamic(
  () => import('./bar-chart').then(m => ({ default: m.EmbedBarChart })),
  { ssr: false, loading: () => <ChartSkeleton /> },
);

export const EmbedPieChart = dynamic(
  () => import('./pie-chart').then(m => ({ default: m.EmbedPieChart })),
  { ssr: false, loading: () => <ChartSkeleton /> },
);

export const EmbedAreaChart = dynamic(
  () => import('./area-chart').then(m => ({ default: m.EmbedAreaChart })),
  { ssr: false, loading: () => <ChartSkeleton /> },
);

export const EmbedKpiCard = dynamic(
  () => import('./kpi-card').then(m => ({ default: m.EmbedKpiCard })),
  { ssr: false, loading: () => <ChartSkeleton /> },
);

export const EmbedDataTable = dynamic(
  () => import('./data-table').then(m => ({ default: m.EmbedDataTable })),
  { ssr: false, loading: () => <ChartSkeleton /> },
);

export const EmbedFunnelChart = dynamic(
  () => import('./funnel-chart').then(m => ({ default: m.EmbedFunnelChart })),
  { ssr: false, loading: () => <ChartSkeleton /> },
);
