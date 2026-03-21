'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { transactionsApi, disputesApi } from '@/lib/api';
import { TransactionTimeline } from '@/components/transaction-timeline';
import { StatusBadge } from '@/components/ui/status-badge';
import { AmountDisplay } from '@/components/ui/amount-display';
import { PageSkeleton } from '@/components/ui/loading-skeleton';
import { TransactionStatus, DisputeReason } from '@cpm/shared';
import { ApiError } from '@/lib/api';
import { formatCents } from '@/lib/utils';
import Link from 'next/link';

export default function BuyerTransactionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const id = params.id as string;

  const [showDisputeForm, setShowDisputeForm] = useState(false);
  const [disputeReason, setDisputeReason] = useState<DisputeReason>(DisputeReason.NOT_DELIVERED);
  const [disputeDescription, setDisputeDescription] = useState('');
  const [actionError, setActionError] = useState('');

  const { data: transaction, isLoading: txnLoading } = useQuery({
    queryKey: ['transaction', id],
    queryFn: () => transactionsApi.get(id),
  });

  const { data: history, isLoading: historyLoading } = useQuery({
    queryKey: ['transaction-history', id],
    queryFn: () => transactionsApi.getHistory(id),
  });

  const confirmMutation = useMutation({
    mutationFn: () => transactionsApi.confirm(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transaction', id] });
      queryClient.invalidateQueries({ queryKey: ['transaction-history', id] });
      setActionError('');
    },
    onError: (err) => {
      setActionError(err instanceof ApiError ? err.message : 'Failed to confirm delivery');
    },
  });

  const disputeMutation = useMutation({
    mutationFn: () =>
      disputesApi.create({
        transactionId: id,
        reason: disputeReason,
        description: disputeDescription,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transaction', id] });
      queryClient.invalidateQueries({ queryKey: ['transaction-history', id] });
      setShowDisputeForm(false);
      setActionError('');
    },
    onError: (err) => {
      setActionError(err instanceof ApiError ? err.message : 'Failed to file dispute');
    },
  });

  if (txnLoading || historyLoading) {
    return <PageSkeleton />;
  }

  if (!transaction) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Transaction not found</p>
        <Link href="/buyer/transactions" className="text-blue-600 hover:text-blue-700 text-sm mt-2 inline-block">
          Back to transactions
        </Link>
      </div>
    );
  }

  const canConfirm = transaction.status === TransactionStatus.DELIVERED;
  const canDispute = [
    TransactionStatus.PAYMENT_HELD,
    TransactionStatus.DELIVERED,
  ].includes(transaction.status);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/buyer/transactions" className="hover:text-gray-700">
          Transactions
        </Link>
        <span>/</span>
        <span className="text-gray-900">{id.slice(0, 8)}...</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main detail card */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-xl font-bold text-gray-900">Transaction Details</h1>
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
                <p className="text-sm text-gray-700">
                  {new Date(transaction.createdAt).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-500 uppercase font-medium mb-1">Description</p>
              <p className="text-sm text-gray-700">{transaction.description}</p>
            </div>

            {transaction.autoReleaseAt && (
              <div className="mt-4 rounded-lg bg-blue-50 border border-blue-200 px-4 py-3 text-sm text-blue-700">
                Auto-release scheduled for{' '}
                {new Date(transaction.autoReleaseAt).toLocaleString()}
              </div>
            )}
          </div>

          {/* Actions */}
          {actionError && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {actionError}
            </div>
          )}

          {(canConfirm || canDispute) && (
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions</h2>
              <div className="flex flex-wrap gap-3">
                {canConfirm && (
                  <button
                    onClick={() => confirmMutation.mutate()}
                    disabled={confirmMutation.isPending}
                    className="rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
                  >
                    {confirmMutation.isPending ? 'Confirming...' : 'Confirm Delivery & Release Funds'}
                  </button>
                )}
                {canDispute && !showDisputeForm && (
                  <button
                    onClick={() => setShowDisputeForm(true)}
                    className="rounded-lg border border-red-300 px-4 py-2.5 text-sm font-medium text-red-700 hover:bg-red-50"
                  >
                    Raise Dispute
                  </button>
                )}
              </div>

              {showDisputeForm && (
                <div className="mt-4 rounded-lg border border-gray-200 p-4 space-y-4">
                  <h3 className="text-sm font-semibold text-gray-900">File a Dispute</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                    <select
                      value={disputeReason}
                      onChange={(e) => setDisputeReason(e.target.value as DisputeReason)}
                      className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      {Object.values(DisputeReason).map((r) => (
                        <option key={r} value={r}>
                          {r.replace(/_/g, ' ')}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description (min 20 characters)
                    </label>
                    <textarea
                      value={disputeDescription}
                      onChange={(e) => setDisputeDescription(e.target.value)}
                      rows={4}
                      className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="Describe the issue in detail..."
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => disputeMutation.mutate()}
                      disabled={disputeMutation.isPending || disputeDescription.length < 20}
                      className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                    >
                      {disputeMutation.isPending ? 'Submitting...' : 'Submit Dispute'}
                    </button>
                    <button
                      onClick={() => setShowDisputeForm(false)}
                      className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Timeline sidebar */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h2>
          <TransactionTimeline history={history ?? []} />
        </div>
      </div>
    </div>
  );
}
