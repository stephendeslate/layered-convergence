'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { adminApi } from '@/lib/api';
import { DataTable } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { AmountDisplay } from '@/components/ui/amount-display';
import { TableSkeleton } from '@/components/ui/loading-skeleton';
import { TransactionStatus } from '@cpm/shared';
import type { TransactionDto } from '@cpm/shared';

const STATUS_OPTIONS = [
  { label: 'All', value: '' },
  ...Object.values(TransactionStatus).map((s) => ({
    label: s.replace(/_/g, ' '),
    value: s,
  })),
];

export default function AdminTransactionsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-transactions', { page, status: statusFilter }],
    queryFn: () =>
      adminApi.listTransactions({
        page,
        limit: 20,
        status: statusFilter || undefined,
      }),
  });

  const columns = [
    {
      key: 'id',
      header: 'ID',
      render: (txn: TransactionDto) => (
        <span className="text-gray-500 font-mono text-xs">{txn.id.slice(0, 8)}...</span>
      ),
    },
    {
      key: 'description',
      header: 'Description',
      render: (txn: TransactionDto) => (
        <span className="text-gray-900 font-medium">
          {txn.description.length > 40 ? txn.description.slice(0, 40) + '...' : txn.description}
        </span>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (txn: TransactionDto) => <AmountDisplay cents={txn.amount} size="sm" />,
    },
    {
      key: 'fee',
      header: 'Fee',
      render: (txn: TransactionDto) => (
        <span className="text-gray-500 font-mono text-sm">
          {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(txn.platformFee / 100)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (txn: TransactionDto) => <StatusBadge status={txn.status} />,
    },
    {
      key: 'date',
      header: 'Created',
      render: (txn: TransactionDto) => (
        <span className="text-gray-500 text-xs">
          {new Date(txn.createdAt).toLocaleDateString()}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">All Transactions</h1>
        <p className="mt-1 text-sm text-gray-500">
          Admin view of all platform transactions
        </p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {STATUS_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => {
              setStatusFilter(opt.value);
              setPage(1);
            }}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              statusFilter === opt.value
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <TableSkeleton cols={6} />
      ) : (
        <DataTable
          columns={columns}
          data={data?.data ?? []}
          keyExtractor={(txn) => txn.id}
          onRowClick={(txn) => router.push(`/admin/transactions/${txn.id}`)}
          emptyTitle="No transactions"
          emptyDescription="No transactions found with the current filters."
          page={data?.page}
          totalPages={data?.totalPages}
          onPageChange={setPage}
          total={data?.total}
        />
      )}
    </div>
  );
}
