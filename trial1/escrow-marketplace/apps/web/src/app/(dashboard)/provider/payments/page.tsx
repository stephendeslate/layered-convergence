'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { transactionsApi } from '@/lib/api';
import { DataTable } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { AmountDisplay } from '@/components/ui/amount-display';
import { TableSkeleton } from '@/components/ui/loading-skeleton';
import { TransactionStatus } from '@cpm/shared';
import type { TransactionDto } from '@cpm/shared';
import { ApiError } from '@/lib/api';

export default function ProviderPaymentsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [actionError, setActionError] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['transactions', { page, status: statusFilter }],
    queryFn: () =>
      transactionsApi.list({
        page,
        limit: 20,
        status: statusFilter || undefined,
      }),
  });

  const deliverMutation = useMutation({
    mutationFn: (id: string) => transactionsApi.deliver(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      setActionError('');
    },
    onError: (err) => {
      setActionError(err instanceof ApiError ? err.message : 'Failed to mark as delivered');
    },
  });

  const STATUS_OPTIONS = [
    { label: 'All', value: '' },
    { label: 'Payment Held', value: TransactionStatus.PAYMENT_HELD },
    { label: 'Delivered', value: TransactionStatus.DELIVERED },
    { label: 'Released', value: TransactionStatus.RELEASED },
    { label: 'Paid Out', value: TransactionStatus.PAID_OUT },
    { label: 'Disputed', value: TransactionStatus.DISPUTED },
  ];

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
      header: 'You Receive',
      render: (txn: TransactionDto) => <AmountDisplay cents={txn.providerAmount} size="sm" />,
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
    {
      key: 'actions',
      header: 'Actions',
      render: (txn: TransactionDto) => {
        if (txn.status === TransactionStatus.PAYMENT_HELD) {
          return (
            <button
              onClick={(e) => {
                e.stopPropagation();
                deliverMutation.mutate(txn.id);
              }}
              disabled={deliverMutation.isPending}
              className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              Mark Delivered
            </button>
          );
        }
        return <span className="text-gray-400 text-xs">--</span>;
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Incoming Payments</h1>
        <p className="mt-1 text-sm text-gray-500">
          View and manage payments from buyers
        </p>
      </div>

      {actionError && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {actionError}
        </div>
      )}

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
          emptyTitle="No incoming payments"
          emptyDescription="You don't have any incoming payments yet."
          page={data?.page}
          totalPages={data?.totalPages}
          onPageChange={setPage}
          total={data?.total}
        />
      )}
    </div>
  );
}
