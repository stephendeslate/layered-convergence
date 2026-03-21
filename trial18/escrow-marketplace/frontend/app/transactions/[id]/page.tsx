import { Suspense } from 'react';
import { Nav } from '@/components/nav';
import { fetchTransaction } from '@/lib/api';
import { TransitionButtons } from '@/components/transition-buttons';
import { LoadingSkeleton } from '@/components/loading-skeleton';
import type { TransactionStatus } from '@/lib/types';

async function TransactionDetail({ id }: { id: string }) {
  const transaction = await fetchTransaction(id);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold">{transaction.title}</h2>
        {transaction.description && (
          <p className="text-gray-600 mt-1">{transaction.description}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <p className="text-sm text-gray-500">Amount</p>
          <p className="font-mono text-lg">${transaction.amount}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Status</p>
          <span className="inline-block px-2 py-1 text-sm rounded bg-gray-100">
            {transaction.status}
          </span>
        </div>
        <div>
          <p className="text-sm text-gray-500">Buyer</p>
          <p>{transaction.buyer?.email ?? transaction.buyerId}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Seller</p>
          <p>{transaction.seller?.email ?? transaction.sellerId}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Created</p>
          <p>{new Date(transaction.createdAt).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="border-t pt-4">
        <h3 className="font-semibold mb-2">Actions</h3>
        <TransitionButtons
          transactionId={transaction.id}
          currentStatus={transaction.status as TransactionStatus}
        />
      </div>
    </div>
  );
}

export default async function TransactionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <>
      <Nav />
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Transaction Details</h1>
        <Suspense fallback={<LoadingSkeleton />}>
          <TransactionDetail id={id} />
        </Suspense>
      </div>
    </>
  );
}
