import { Suspense } from 'react';
import Link from 'next/link';
import { getTransactions } from '@/lib/api';
import { TransactionCard } from '@/components/transactions/transaction-card';
import { Button } from '@/components/ui/button';
import type { TransactionStatus } from '@/lib/types';

const STATUSES: TransactionStatus[] = [
  'PENDING', 'FUNDED', 'SHIPPED', 'DELIVERED',
  'RELEASED', 'CANCELLED', 'DISPUTED', 'RESOLVED', 'REFUNDED',
];

async function TransactionsList({ status }: { status?: string }) {
  const transactions = await getTransactions(status);

  if (transactions.length === 0) {
    return (
      <p className="text-gray-500 py-8 text-center">
        No transactions found{status ? ` with status ${status}` : ''}.
      </p>
    );
  }

  return (
    <div className="grid gap-4">
      {transactions.map((txn) => (
        <TransactionCard key={txn.id} transaction={txn} />
      ))}
    </div>
  );
}

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Transactions</h1>
        <Link href="/transactions/create">
          <Button>Create Transaction</Button>
        </Link>
      </div>

      <nav aria-label="Filter by status" className="flex flex-wrap gap-2">
        <Link href="/transactions">
          <Button variant={!status ? 'default' : 'outline'} size="sm">
            All
          </Button>
        </Link>
        {STATUSES.map((s) => (
          <Link key={s} href={`/transactions?status=${s}`}>
            <Button variant={status === s ? 'default' : 'outline'} size="sm">
              {s}
            </Button>
          </Link>
        ))}
      </nav>

      <Suspense
        fallback={
          <div role="status" className="flex flex-col gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded animate-pulse" />
            ))}
            <span className="sr-only">Loading transactions...</span>
          </div>
        }
      >
        <TransactionsList status={status} />
      </Suspense>
    </div>
  );
}
