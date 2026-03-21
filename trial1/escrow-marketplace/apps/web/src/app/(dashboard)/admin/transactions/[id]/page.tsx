'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { transactionsApi } from '@/lib/api';
import { TransactionTimeline } from '@/components/transaction-timeline';
import { StatusBadge } from '@/components/ui/status-badge';
import { AmountDisplay } from '@/components/ui/amount-display';
import { PageSkeleton } from '@/components/ui/loading-skeleton';
import { TransactionStatus } from '@cpm/shared';
import { ApiError } from '@/lib/api';
import { formatCents } from '@/lib/utils';
import Link from 'next/link';

export default function AdminTransactionDetailPage() {
  const params = useParams();
  const queryClient = useQueryClient();
  const id = params.id as string;
  const [actionError, setActionError] = useState('');

  const { data: transaction, isLoading: txnLoading } = useQuery({
    queryKey: ['transaction', id],
    queryFn: () => transactionsApi.get(id),
  });

  const { data: history, isLoading: historyLoading } = useQuery({
    queryKey: ['transaction-history', id],
    queryFn: () => transactionsApi.getHistory(id),
  });

  const releaseMutation = useMutation({
    mutationFn: () => transactionsApi.release(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transaction', id] });
      queryClient.invalidateQueries({ queryKey: ['transaction-history', id] });
      setActionError('');
    },
    onError: (err) => {
      setActionError(err instanceof ApiError ? err.message : 'Failed to release funds');
    },
  });

  if (txnLoading || historyLoading) return <PageSkeleton />;

  if (!transaction) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Transaction not found</p>
        <Link href="/admin/transactions" className="text-blue-600 hover:text-blue-700 text-sm mt-2 inline-block">
          Back to transactions
        </Link>
      </div>
    );
  }

  const canRelease = [
    TransactionStatus.DELIVERED,
    TransactionStatus.DISPUTED,
  ].includes(transaction.status);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/admin/transactions" className="hover:text-gray-700">
          All Transactions
        </Link>
        <span>/</span>
        <span className="text-gray-900">{id.slice(0, 8)}...</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-xl font-bold text-gray-900">Transaction Details (Admin)</h1>
                <p className="text-sm text-gray-500 mt-1 font-mono">{transaction.id}</p>
              </div>
              <StatusBadge status={transaction.status} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium">Amount</p>
                <AmountDisplay cents={transaction.amount} size="lg" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium">Platform Fee</p>
                <p className="text-lg font-mono text-gray-700">{formatCents(transaction.platformFee)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium">Provider Receives</p>
                <p className="text-lg font-mono text-gray-700">{formatCents(transaction.providerAmount)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium">Created</p>
                <p className="text-sm text-gray-700">{new Date(transaction.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium">Buyer ID</p>
                <p className="text-sm text-gray-700 font-mono">{transaction.buyerId.slice(0, 12)}...</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium">Provider ID</p>
                <p className="text-sm text-gray-700 font-mono">{transaction.providerId.slice(0, 12)}...</p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-500 uppercase font-medium mb-1">Description</p>
              <p className="text-sm text-gray-700">{transaction.description}</p>
            </div>

            {transaction.stripePaymentIntentId && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500 uppercase font-medium mb-1">Stripe Payment Intent</p>
                <p className="text-sm text-gray-700 font-mono">{transaction.stripePaymentIntentId}</p>
              </div>
            )}
          </div>

          {/* Admin actions */}
          {actionError && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {actionError}
            </div>
          )}

          {canRelease && (
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Admin Actions</h2>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => releaseMutation.mutate()}
                  disabled={releaseMutation.isPending}
                  className="rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
                >
                  {releaseMutation.isPending ? 'Releasing...' : 'Release Funds to Provider'}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h2>
          <TransactionTimeline history={history ?? []} />
        </div>
      </div>
    </div>
  );
}
