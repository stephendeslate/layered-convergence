'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { transactionsApi } from '@/lib/api';
import { DataTable } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { AmountDisplay } from '@/components/ui/amount-display';
import { TableSkeleton } from '@/components/ui/loading-skeleton';
import { TransactionStatus } from '@cpm/shared';
import type { TransactionDto } from '@cpm/shared';
import Link from 'next/link';

const STATUS_OPTIONS = [
  { label: 'All', value: '' },
  { label: 'Payment Held', value: TransactionStatus.PAYMENT_HELD },
  { label: 'Delivered', value: TransactionStatus.DELIVERED },
  { label: 'Released', value: TransactionStatus.RELEASED },
  { label: 'Paid Out', value: TransactionStatus.PAID_OUT },
  { label: 'Disputed', value: TransactionStatus.DISPUTED },
  { label: 'Refunded', value: TransactionStatus.REFUNDED },
];

export default function BuyerTransactionsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['transactions', { page, status: statusFilter }],
    queryFn: () =>
      transactionsApi.list({
        page,
        limit: 20,
        status: statusFilter || undefined,
      }),
  });

  const columns = [
    {
      key: 'description',
      header: 'Description',
      render: (txn: TransactionDto) => (
        <span className="text-gray-900 font-medium">
          {txn.description.length > 50 ? txn.description.slice(0, 50) + '...' : txn.description}
        </span>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (txn: TransactionDto) => <AmountDisplay cents={txn.amount} size="sm" />,
    },
    {
      key: 'status',
      header: 'Status',
      render: (txn: TransactionDto) => <StatusBadge status={txn.status} />,
    },
    {
      key: 'date',
      header: 'Date',
      render: (txn: TransactionDto) => (
        <span className="text-gray-500">
          {new Date(txn.createdAt).toLocaleDateString()}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Transactions</h1>
          <p className="mt-1 text-sm text-gray-500">View and manage your payment holds</p>
        </div>
        <Link
          href="/buyer/transactions/new"
          className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          Create Payment
        </Link>
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
        <TableSkeleton />
      ) : (
        <DataTable
          columns={columns}
          data={data?.data ?? []}
          keyExtractor={(txn) => txn.id}
          onRowClick={(txn) => router.push(`/buyer/transactions/${txn.id}`)}
          emptyTitle="No transactions"
          emptyDescription="Create your first payment hold to get started."
          page={data?.page}
          totalPages={data?.totalPages}
          onPageChange={setPage}
          total={data?.total}
        />
      )}
    </div>
  );
}
