import { Suspense } from 'react';
import Link from 'next/link';
import { getStatusCounts, getTransactions } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { TransactionCard } from '@/components/transactions/transaction-card';
import type { StatusCounts, Transaction } from '@/lib/types';

async function StatusCountCards() {
  let counts: StatusCounts;
  try {
    counts = await getStatusCounts();
  } catch {
    counts = {};
  }

  const statuses = [
    { key: 'PENDING', label: 'Pending' },
    { key: 'FUNDED', label: 'Funded' },
    { key: 'SHIPPED', label: 'Shipped' },
    { key: 'DISPUTED', label: 'Disputed' },
    { key: 'RELEASED', label: 'Released' },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      {statuses.map(({ key, label }) => (
        <Card key={key}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              {label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{counts[key] || 0}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

async function RecentTransactions() {
  let transactions: Transaction[];
  try {
    transactions = await getTransactions();
  } catch {
    transactions = [];
  }

  const recent = transactions.slice(0, 6);

  if (recent.length === 0) {
    return (
      <p className="text-center text-gray-500">
        No transactions yet.{' '}
        <Link href="/transactions/create" className="text-blue-600 hover:underline">
          Create one
        </Link>
      </p>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {recent.map((t) => (
        <TransactionCard key={t.id} transaction={t} />
      ))}
    </div>
  );
}

function StatusCountSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="pb-2">
            <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
          </CardHeader>
          <CardContent>
            <div className="h-8 w-12 animate-pulse rounded bg-gray-200" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function TransactionsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <div className="h-6 w-48 animate-pulse rounded bg-gray-200" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Link
          href="/transactions/create"
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          New Transaction
        </Link>
      </div>

      <section aria-label="Status overview">
        <h2 className="mb-4 text-lg font-semibold">Overview</h2>
        <Suspense fallback={<StatusCountSkeleton />}>
          <StatusCountCards />
        </Suspense>
      </section>

      <section aria-label="Recent transactions">
        <h2 className="mb-4 text-lg font-semibold">Recent Transactions</h2>
        <Suspense fallback={<TransactionsSkeleton />}>
          <RecentTransactions />
        </Suspense>
      </section>
    </div>
  );
}
