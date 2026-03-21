'use client';

import { useQuery } from '@tanstack/react-query';
import { transactionsApi, payoutsApi, onboardingApi } from '@/lib/api';
import { MetricCard } from '@/components/ui/metric-card';
import { PageSkeleton } from '@/components/ui/loading-skeleton';
import { StatusBadge } from '@/components/ui/status-badge';
import { formatCents } from '@/lib/utils';
import { TransactionStatus, PayoutStatus } from '@cpm/shared';
import Link from 'next/link';

export default function ProviderDashboard() {
  const { data: txns, isLoading: txnLoading } = useQuery({
    queryKey: ['transactions', { limit: 100 }],
    queryFn: () => transactionsApi.list({ limit: 100 }),
  });

  const { data: payouts, isLoading: payoutLoading } = useQuery({
    queryKey: ['payouts', { limit: 100 }],
    queryFn: () => payoutsApi.list({ limit: 100 }),
  });

  const { data: onboarding, isLoading: onboardingLoading } = useQuery({
    queryKey: ['onboarding-status'],
    queryFn: () => onboardingApi.getStatus(),
  });

  if (txnLoading || payoutLoading || onboardingLoading) {
    return <PageSkeleton />;
  }

  const transactions = txns?.data ?? [];
  const allPayouts = payouts?.data ?? [];

  const pendingPayments = transactions.filter(
    (t) =>
      t.status === TransactionStatus.PAYMENT_HELD ||
      t.status === TransactionStatus.DELIVERED,
  );
  const pendingTotal = pendingPayments.reduce((sum, t) => sum + t.providerAmount, 0);

  const totalEarned = allPayouts
    .filter((p) => p.status === PayoutStatus.PAID)
    .reduce((sum, p) => sum + p.amount, 0);

  const availableBalance = transactions
    .filter((t) => t.status === TransactionStatus.RELEASED)
    .reduce((sum, t) => sum + t.providerAmount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Provider Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Overview of your incoming payments and earnings
        </p>
      </div>

      {/* Onboarding status */}
      {onboarding && onboarding.onboardingStatus !== 'COMPLETE' && (
        <div className="rounded-xl border-2 border-yellow-300 bg-yellow-50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-yellow-800">Complete Stripe Onboarding</h2>
              <p className="text-sm text-yellow-700 mt-1">
                You need to complete Stripe onboarding to receive payments.
              </p>
            </div>
            <Link
              href="/provider/onboarding"
              className="rounded-lg bg-yellow-600 px-4 py-2 text-sm font-medium text-white hover:bg-yellow-700"
            >
              Complete Setup
            </Link>
          </div>
          <div className="mt-3">
            <StatusBadge status={onboarding.onboardingStatus} />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCard label="Pending Payments" value={formatCents(pendingTotal)} />
        <MetricCard label="Available Balance" value={formatCents(availableBalance)} />
        <MetricCard label="Total Earned" value={formatCents(totalEarned)} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent incoming payments */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Incoming Payments</h2>
            <Link
              href="/provider/payments"
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              View all
            </Link>
          </div>
          {pendingPayments.length === 0 ? (
            <p className="text-sm text-gray-500 py-6 text-center">No pending payments</p>
          ) : (
            <div className="space-y-3">
              {pendingPayments.slice(0, 5).map((txn) => (
                <div
                  key={txn.id}
                  className="flex items-center justify-between rounded-lg border border-gray-100 p-3"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {txn.description.length > 40
                        ? txn.description.slice(0, 40) + '...'
                        : txn.description}
                    </p>
                    <StatusBadge status={txn.status} className="mt-1" />
                  </div>
                  <span className="text-sm font-mono font-medium text-gray-900">
                    {formatCents(txn.providerAmount)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent payouts */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Payouts</h2>
            <Link
              href="/provider/payouts"
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              View all
            </Link>
          </div>
          {allPayouts.length === 0 ? (
            <p className="text-sm text-gray-500 py-6 text-center">No payouts yet</p>
          ) : (
            <div className="space-y-3">
              {allPayouts.slice(0, 5).map((payout) => (
                <div
                  key={payout.id}
                  className="flex items-center justify-between rounded-lg border border-gray-100 p-3"
                >
                  <div>
                    <p className="text-sm text-gray-700">
                      {new Date(payout.createdAt).toLocaleDateString()}
                    </p>
                    <StatusBadge status={payout.status} className="mt-1" />
                  </div>
                  <span className="text-sm font-mono font-medium text-gray-900">
                    {formatCents(payout.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
