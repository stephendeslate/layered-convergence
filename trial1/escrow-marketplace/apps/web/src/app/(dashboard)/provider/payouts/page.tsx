'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { payoutsApi } from '@/lib/api';
import { DataTable } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { AmountDisplay } from '@/components/ui/amount-display';
import { TableSkeleton } from '@/components/ui/loading-skeleton';
import type { PayoutDto } from '@cpm/shared';

export default function ProviderPayoutsPage() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['payouts', { page }],
    queryFn: () => payoutsApi.list({ page, limit: 20 }),
  });

  const columns = [
    {
      key: 'amount',
      header: 'Amount',
      render: (p: PayoutDto) => <AmountDisplay cents={p.amount} size="sm" />,
    },
    {
      key: 'status',
      header: 'Status',
      render: (p: PayoutDto) => <StatusBadge status={p.status} />,
    },
    {
      key: 'stripeId',
      header: 'Stripe Payout ID',
      render: (p: PayoutDto) => (
        <span className="text-gray-500 font-mono text-xs">
          {p.stripePayoutId ?? '--'}
        </span>
      ),
    },
    {
      key: 'paidAt',
      header: 'Paid At',
      render: (p: PayoutDto) => (
        <span className="text-gray-500">
          {p.paidAt ? new Date(p.paidAt).toLocaleDateString() : '--'}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Created',
      render: (p: PayoutDto) => (
        <span className="text-gray-500">
          {new Date(p.createdAt).toLocaleDateString()}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Payout History</h1>
        <p className="mt-1 text-sm text-gray-500">
          Track your payouts to your bank account
        </p>
      </div>

      {isLoading ? (
        <TableSkeleton />
      ) : (
        <DataTable
          columns={columns}
          data={data?.data ?? []}
          keyExtractor={(p) => p.id}
          emptyTitle="No payouts"
          emptyDescription="You haven't received any payouts yet. Payouts are initiated after funds are released."
          page={data?.page}
          totalPages={data?.totalPages}
          onPageChange={setPage}
          total={data?.total}
        />
      )}
    </div>
  );
}
