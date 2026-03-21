import { Suspense } from 'react';
import Link from 'next/link';
import { getTransactions } from '@/lib/api';
import { TransactionCard } from '@/components/transactions/transaction-card';
import type { Transaction, TransactionStatus } from '@/lib/types';

interface TransactionsPageProps {
  searchParams: Promise<{ status?: string }>;
}

async function TransactionList({ status }: { status?: string }) {
  let transactions: Transaction[];
  try {
    transactions = await getTransactions();
  } catch {
    transactions = [];
  }

  const filtered = status
    ? transactions.filter((t) => t.status === status)
    : transactions;

  if (filtered.length === 0) {
    return (
      <p className="py-8 text-center text-gray-500">
        No transactions found.{' '}
        <Link href="/transactions/create" className="text-blue-600 hover:underline">
          Create one
        </Link>
      </p>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {filtered.map((t) => (
        <TransactionCard key={t.id} transaction={t} />
      ))}
    </div>
  );
}

const ALL_STATUSES: TransactionStatus[] = [
  'PENDING',
  'FUNDED',
  'SHIPPED',
  'DELIVERED',
  'RELEASED',
  'CANCELLED',
  'DISPUTED',
  'RESOLVED',
  'REFUNDED',
];

export default async function TransactionsPage({ searchParams }: TransactionsPageProps) {
  const params = await searchParams;
  const currentStatus = params.status;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Transactions</h1>
        <Link
          href="/transactions/create"
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          New Transaction
        </Link>
      </div>

      <nav className="flex flex-wrap gap-2" aria-label="Status filter">
        <Link
          href="/transactions"
          className={`rounded-md px-3 py-1.5 text-sm font-medium ${
            !currentStatus
              ? 'bg-gray-900 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All
        </Link>
        {ALL_STATUSES.map((s) => (
          <Link
            key={s}
            href={`/transactions?status=${s}`}
            className={`rounded-md px-3 py-1.5 text-sm font-medium ${
              currentStatus === s
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {s}
          </Link>
        ))}
      </nav>

      <Suspense fallback={<TransactionListSkeleton />}>
        <TransactionList status={currentStatus} />
      </Suspense>
    </div>
  );
}

function TransactionListSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
        >
          <div className="space-y-3">
            <div className="h-6 w-3/4 animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-1/3 animate-pulse rounded bg-gray-200" />
          </div>
        </div>
      ))}
    </div>
  );
}
