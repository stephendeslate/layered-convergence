import { Suspense } from 'react';
import Link from 'next/link';
import { getDispute, getCurrentUser } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { cn, getStatusColor, formatDate, formatCurrency } from '@/lib/utils';
import type { Dispute, User } from '@/lib/types';
import { ResolveDisputeForm } from './resolve-form';

interface DisputeDetailPageProps {
  params: Promise<{ id: string }>;
}

async function DisputeDetail({ id }: { id: string }) {
  let dispute: Dispute;
  let currentUser: User | null = null;

  try {
    dispute = await getDispute(id);
  } catch {
    return (
      <div className="py-8 text-center">
        <p className="text-gray-500">Dispute not found</p>
        <Link href="/disputes" className="mt-2 text-blue-600 hover:underline">
          Back to disputes
        </Link>
      </div>
    );
  }

  try {
    currentUser = await getCurrentUser();
  } catch {
    currentUser = null;
  }

  const isAdmin = currentUser?.role === 'ADMIN';
  const canResolve = isAdmin && dispute.transaction.status === 'DISPUTED';

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/disputes"
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          &larr; Back to disputes
        </Link>
        <div className="mt-2 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Dispute Details</h1>
          <span
            className={cn(
              'inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold',
              getStatusColor(dispute.transaction.status),
            )}
          >
            {dispute.transaction.status}
          </span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Dispute Information</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-gray-500">Reason</dt>
                <dd className="mt-1">{dispute.reason}</dd>
              </div>
              {dispute.evidence && (
                <div>
                  <dt className="text-gray-500">Evidence</dt>
                  <dd className="mt-1">{dispute.evidence}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-gray-500">Filed by</dt>
                <dd>{dispute.filedBy.name}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Filed on</dt>
                <dd>{formatDate(dispute.createdAt)}</dd>
              </div>
              {dispute.resolution && (
                <div className="flex justify-between">
                  <dt className="text-gray-500">Resolution</dt>
                  <dd className="font-semibold">{dispute.resolution}</dd>
                </div>
              )}
              {dispute.resolution && (
                <div className="flex justify-between">
                  <dt className="text-gray-500">Updated</dt>
                  <dd>{formatDate(dispute.updatedAt)}</dd>
                </div>
              )}
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Related Transaction</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">Title</dt>
                <dd>{dispute.transaction.title}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Amount</dt>
                <dd className="font-semibold">
                  {formatCurrency(dispute.transaction.amount)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Status</dt>
                <dd>{dispute.transaction.status}</dd>
              </div>
            </dl>
            <Link
              href={`/transactions/${dispute.transactionId}`}
              className="mt-4 block text-sm text-blue-600 hover:underline"
            >
              View transaction
            </Link>
          </CardContent>
        </Card>
      </div>

      {canResolve && (
        <Card>
          <CardHeader>
            <CardTitle>Resolve Dispute</CardTitle>
          </CardHeader>
          <CardContent>
            <ResolveDisputeForm disputeId={dispute.id} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function DisputeDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-9 w-48 animate-pulse rounded bg-gray-200" />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border p-6">
          <div className="space-y-3">
            <div className="h-6 w-32 animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
          </div>
        </div>
        <div className="rounded-lg border p-6">
          <div className="space-y-3">
            <div className="h-6 w-32 animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-48 animate-pulse rounded bg-gray-200" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function DisputeDetailPage({
  params,
}: DisputeDetailPageProps) {
  const { id } = await params;

  return (
    <Suspense fallback={<DisputeDetailSkeleton />}>
      <DisputeDetail id={id} />
    </Suspense>
  );
}
