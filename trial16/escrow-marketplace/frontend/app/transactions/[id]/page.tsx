import { Suspense } from 'react';
import Link from 'next/link';
import { getTransaction, getCurrentUser } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/transactions/status-badge';
import { StateTimeline } from '@/components/transactions/state-timeline';
import { TransitionButtons } from '@/components/transactions/transition-buttons';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Transaction, User } from '@/lib/types';

interface TransactionDetailPageProps {
  params: Promise<{ id: string }>;
}

async function TransactionDetail({ id }: { id: string }) {
  let transaction: Transaction;
  let currentUser: User | null = null;

  try {
    transaction = await getTransaction(id);
  } catch {
    return (
      <div className="py-8 text-center">
        <p className="text-gray-500">Transaction not found</p>
        <Link href="/transactions" className="mt-2 text-blue-600 hover:underline">
          Back to transactions
        </Link>
      </div>
    );
  }

  try {
    currentUser = await getCurrentUser();
  } catch {
    currentUser = null;
  }

  const isBuyer = currentUser?.id === transaction.buyerId;
  const isSeller = currentUser?.id === transaction.sellerId;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/transactions"
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            &larr; Back to transactions
          </Link>
          <h1 className="mt-2 text-3xl font-bold">{transaction.title}</h1>
        </div>
        <StatusBadge status={transaction.status} />
      </div>

      <StateTimeline currentStatus={transaction.status} />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Transaction Details</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">Amount</dt>
                <dd className="font-semibold">
                  {formatCurrency(transaction.amount)}
                </dd>
              </div>
              {transaction.description && (
                <div className="flex justify-between">
                  <dt className="text-gray-500">Description</dt>
                  <dd>{transaction.description}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-gray-500">Created</dt>
                <dd>{formatDate(transaction.createdAt)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Last updated</dt>
                <dd>{formatDate(transaction.updatedAt)}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Participants</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-gray-500">Buyer</dt>
                <dd className="font-medium">
                  {transaction.buyer.name} ({transaction.buyer.email})
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">Seller</dt>
                <dd className="font-medium">
                  {transaction.seller.name} ({transaction.seller.email})
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>

      {currentUser && (
        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <TransitionButtons
              transactionId={transaction.id}
              currentStatus={transaction.status}
              userRole={currentUser.role}
              isBuyer={isBuyer}
              isSeller={isSeller}
            />
          </CardContent>
        </Card>
      )}

      {transaction.disputes && transaction.disputes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Disputes</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {transaction.disputes.map((d) => (
                <li key={d.id} className="rounded border p-3 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium">{d.reason}</span>
                    {d.resolution && (
                      <span className="text-gray-500">{d.resolution}</span>
                    )}
                  </div>
                  <Link
                    href={`/disputes/${d.id}`}
                    className="mt-1 text-blue-600 hover:underline"
                  >
                    View dispute
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function TransactionDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-9 w-64 animate-pulse rounded bg-gray-200" />
      <div className="h-12 w-full animate-pulse rounded bg-gray-200" />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border p-6">
          <div className="space-y-3">
            <div className="h-6 w-32 animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-48 animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-40 animate-pulse rounded bg-gray-200" />
          </div>
        </div>
        <div className="rounded-lg border p-6">
          <div className="space-y-3">
            <div className="h-6 w-32 animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-48 animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-40 animate-pulse rounded bg-gray-200" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function TransactionDetailPage({
  params,
}: TransactionDetailPageProps) {
  const { id } = await params;

  return (
    <Suspense fallback={<TransactionDetailSkeleton />}>
      <TransactionDetail id={id} />
    </Suspense>
  );
}
