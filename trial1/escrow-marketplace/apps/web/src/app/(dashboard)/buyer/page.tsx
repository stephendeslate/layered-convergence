'use client';

import { useQuery } from '@tanstack/react-query';
import { transactionsApi, disputesApi } from '@/lib/api';
import { MetricCard } from '@/components/ui/metric-card';
import { PageSkeleton } from '@/components/ui/loading-skeleton';
import { formatCents } from '@/lib/utils';
import { TransactionStatus } from '@cpm/shared';
import Link from 'next/link';

export default function BuyerDashboard() {
  const { data: txns, isLoading: txnLoading } = useQuery({
    queryKey: ['transactions', { limit: 100 }],
    queryFn: () => transactionsApi.list({ limit: 100 }),
  });

  const { data: disputes, isLoading: disputeLoading } = useQuery({
    queryKey: ['disputes', { limit: 100 }],
    queryFn: () => disputesApi.list({ limit: 100 }),
  });

  if (txnLoading || disputeLoading) {
    return <PageSkeleton />;
  }

  const transactions = txns?.data ?? [];
  const activeHolds = transactions.filter(
    (t) => t.status === TransactionStatus.PAYMENT_HELD || t.status === TransactionStatus.DELIVERED,
  ).length;
  const totalSpent = transactions
    .filter((t) =>
      [TransactionStatus.RELEASED, TransactionStatus.PAID_OUT].includes(t.status),
    )
    .reduce((sum, t) => sum + t.amount, 0);
  const activeDisputes = (disputes?.data ?? []).filter(
    (d) => d.status === 'OPEN' || d.status === 'UNDER_REVIEW',
  ).length;
  const recentTxns = transactions.slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Buyer Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Overview of your payment holds and transactions
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCard label="Active Holds" value={activeHolds} />
        <MetricCard label="Total Spent" value={formatCents(totalSpent)} />
        <MetricCard label="Active Disputes" value={activeDisputes} />
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
          <Link
            href="/buyer/transactions"
            className="text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            View all
          </Link>
        </div>

        {recentTxns.length === 0 ? (
          <p className="text-sm text-gray-500 py-8 text-center">
            No transactions yet.{' '}
            <Link href="/buyer/transactions/new" className="text-blue-600 hover:text-blue-700">
              Create your first payment hold
            </Link>
          </p>
        ) : (
          <div className="space-y-3">
            {recentTxns.map((txn) => (
              <Link
                key={txn.id}
                href={`/buyer/transactions/${txn.id}`}
                className="flex items-center justify-between rounded-lg border border-gray-100 p-4 hover:bg-gray-50 transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {txn.description.length > 60
                      ? txn.description.slice(0, 60) + '...'
                      : txn.description}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(txn.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-mono font-medium text-gray-900">
                    {formatCents(txn.amount)}
                  </p>
                  <span
                    className={`inline-block mt-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                      txn.status === TransactionStatus.PAYMENT_HELD
                        ? 'bg-blue-100 text-blue-700'
                        : txn.status === TransactionStatus.RELEASED ||
                            txn.status === TransactionStatus.PAID_OUT
                          ? 'bg-green-100 text-green-700'
                          : txn.status === TransactionStatus.DISPUTED
                            ? 'bg-red-100 text-red-700'
                            : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {txn.status.replace(/_/g, ' ')}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
