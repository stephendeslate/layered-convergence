'use client';

import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import { MetricCard } from '@/components/ui/metric-card';
import { PageSkeleton } from '@/components/ui/loading-skeleton';
import { VolumeChart } from '@/components/charts/volume-chart';
import { FeeChart } from '@/components/charts/fee-chart';
import { DisputeGauge } from '@/components/charts/dispute-gauge';
import { formatCents } from '@/lib/utils';
import { TransactionStatus } from '@cpm/shared';

export default function AdminDashboard() {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: () => adminApi.getAnalytics(),
  });

  if (isLoading) return <PageSkeleton />;

  if (!analytics) {
    return <p className="text-gray-500 text-center py-12">Failed to load analytics</p>;
  }

  const statusCounts = analytics.transactionsByStatus ?? {};

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">Platform analytics and overview</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Total Transactions" value={analytics.totalTransactions} />
        <MetricCard label="Total Volume" value={formatCents(analytics.totalVolumeCents)} />
        <MetricCard label="Platform Fees" value={formatCents(analytics.totalFeesCents)} />
        <MetricCard label="Active Disputes" value={analytics.activeDisputes} />
      </div>

      {/* Status breakdown */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Transactions by Status</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {Object.values(TransactionStatus).map((status) => (
            <div key={status} className="rounded-lg border border-gray-100 p-3 text-center">
              <p className="text-2xl font-bold text-gray-900">
                {(statusCounts as Record<string, number>)[status] ?? 0}
              </p>
              <p className="text-xs text-gray-500 mt-1">{status.replace(/_/g, ' ')}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Transaction volume chart */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Transaction Volume</h2>
          <VolumeChart data={analytics.volumeByDay ?? []} />
        </div>

        {/* Fee revenue chart */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Platform Fee Revenue</h2>
          <FeeChart data={analytics.volumeByDay ?? []} />
        </div>
      </div>

      {/* Dispute rate gauge */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 flex flex-col items-center">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Dispute Rate</h2>
        <DisputeGauge rate={analytics.disputeRate} />
      </div>
    </div>
  );
}
