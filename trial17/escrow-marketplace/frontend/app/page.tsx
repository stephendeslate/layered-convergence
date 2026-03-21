import { Suspense } from 'react';
import Link from 'next/link';
import { getTransactions } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/transactions/status-badge';
import { formatCurrency } from '@/lib/utils';
import type { TransactionStatus } from '@/lib/types';

async function RecentTransactions() {
  let transactions;
  try {
    transactions = await getTransactions();
  } catch {
    return (
      <p className="text-gray-500">
        Sign in to view your transactions.
      </p>
    );
  }

  const recent = transactions.slice(0, 5);

  if (recent.length === 0) {
    return <p className="text-gray-500">No transactions yet.</p>;
  }

  return (
    <ul className="flex flex-col gap-3">
      {recent.map((txn) => (
        <li key={txn.id}>
          <Link href={`/transactions/${txn.id}`} className="block hover:bg-gray-50 p-3 rounded-md border">
            <div className="flex items-center justify-between">
              <span className="font-medium">{txn.title}</span>
              <StatusBadge status={txn.status} />
            </div>
            <div className="text-sm text-gray-500 mt-1">
              {formatCurrency(txn.amount)}
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}

async function StatusSummary() {
  let transactions;
  try {
    transactions = await getTransactions();
  } catch {
    return null;
  }

  const counts: Record<string, number> = {};
  for (const txn of transactions) {
    counts[txn.status] = (counts[txn.status] || 0) + 1;
  }

  const statuses: TransactionStatus[] = [
    'PENDING', 'FUNDED', 'SHIPPED', 'DELIVERED',
    'RELEASED', 'CANCELLED', 'DISPUTED', 'RESOLVED', 'REFUNDED',
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {statuses.map((status) => (
        <Card key={status}>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <StatusBadge status={status} />
              <span className="text-2xl font-bold">{counts[status] || 0}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-500 mt-1">Overview of your escrow marketplace activity</p>
      </div>

      <section aria-labelledby="status-heading">
        <h2 id="status-heading" className="text-xl font-semibold mb-4">
          Status Overview
        </h2>
        <Suspense
          fallback={
            <div role="status" className="grid grid-cols-3 gap-3">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded animate-pulse" />
              ))}
              <span className="sr-only">Loading status counts...</span>
            </div>
          }
        >
          <StatusSummary />
        </Suspense>
      </section>

      <section aria-labelledby="recent-heading">
        <div className="flex items-center justify-between mb-4">
          <h2 id="recent-heading" className="text-xl font-semibold">
            Recent Transactions
          </h2>
          <Link href="/transactions/create" className="text-sm text-blue-600 hover:underline">
            Create New
          </Link>
        </div>
        <Suspense
          fallback={
            <div role="status" className="flex flex-col gap-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded animate-pulse" />
              ))}
              <span className="sr-only">Loading recent transactions...</span>
            </div>
          }
        >
          <RecentTransactions />
        </Suspense>
      </section>
    </div>
  );
}
