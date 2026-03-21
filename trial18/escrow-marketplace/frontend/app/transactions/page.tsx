import { Suspense } from 'react';
import Link from 'next/link';
import { Nav } from '@/components/nav';
import { fetchTransactions } from '@/lib/api';
import { LoadingSkeleton } from '@/components/loading-skeleton';

async function TransactionsList() {
  const transactions = await fetchTransactions();

  return (
    <div className="space-y-4">
      {transactions.length === 0 ? (
        <p className="text-gray-500">No transactions found.</p>
      ) : (
        transactions.map((tx) => (
          <Link
            key={tx.id}
            href={`/transactions/${tx.id}`}
            className="block p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">{tx.title}</h3>
                <p className="text-sm text-gray-500">{tx.description}</p>
              </div>
              <div className="text-right">
                <p className="font-mono">${tx.amount}</p>
                <span className="inline-block mt-1 px-2 py-0.5 text-xs rounded bg-gray-100">
                  {tx.status}
                </span>
              </div>
            </div>
          </Link>
        ))
      )}
    </div>
  );
}

export default function TransactionsPage() {
  return (
    <>
      <Nav />
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Transactions</h1>
          <Link
            href="/transactions/create"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            New Transaction
          </Link>
        </div>
        <Suspense fallback={<LoadingSkeleton />}>
          <TransactionsList />
        </Suspense>
      </div>
    </>
  );
}
