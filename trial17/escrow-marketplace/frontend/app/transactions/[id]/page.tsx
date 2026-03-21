import { Suspense } from 'react';
import Link from 'next/link';
import { getTransaction } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/transactions/status-badge';
import { TransitionButtons } from '@/components/transactions/transition-buttons';
import { formatCurrency, formatDate } from '@/lib/utils';

async function TransactionDetail({ id }: { id: string }) {
  const transaction = await getTransaction(id);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{transaction.title}</h1>
        <StatusBadge status={transaction.status} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-gray-500">Amount</dt>
              <dd className="text-lg font-semibold">
                {formatCurrency(transaction.amount)}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500">Platform Fee</dt>
              <dd className="text-lg font-semibold">
                {formatCurrency(transaction.platformFee)}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500">Buyer</dt>
              <dd>{transaction.buyer?.name || transaction.buyerId}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Seller</dt>
              <dd>{transaction.seller?.name || transaction.sellerId}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Created</dt>
              <dd>{formatDate(transaction.createdAt)}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Updated</dt>
              <dd>{formatDate(transaction.updatedAt)}</dd>
            </div>
            {transaction.description && (
              <div className="col-span-2">
                <dt className="text-gray-500">Description</dt>
                <dd>{transaction.description}</dd>
              </div>
            )}
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <TransitionButtons
            transactionId={transaction.id}
            currentStatus={transaction.status}
          />
        </CardContent>
      </Card>

      {transaction.disputes && transaction.disputes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Disputes</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-2">
              {transaction.disputes.map((dispute) => (
                <li key={dispute.id} className="border rounded p-3">
                  <Link
                    href={`/disputes/${dispute.id}`}
                    className="font-medium hover:underline"
                  >
                    {dispute.reason}
                  </Link>
                  {dispute.resolution && (
                    <p className="text-sm text-gray-500 mt-1">
                      Resolution: {dispute.resolution}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
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
    <div>
      <Link href="/transactions" className="text-sm text-blue-600 hover:underline mb-4 inline-block">
        Back to Transactions
      </Link>
      <Suspense
        fallback={
          <div role="status" className="flex flex-col gap-4">
            <div className="h-8 bg-gray-200 rounded w-64 animate-pulse" />
            <div className="h-48 bg-gray-200 rounded animate-pulse" />
            <span className="sr-only">Loading transaction details...</span>
          </div>
        }
      >
        <TransactionDetail id={id} />
      </Suspense>
    </div>
  );
}
