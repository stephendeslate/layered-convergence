import { Suspense } from 'react';
import Link from 'next/link';
import { getDispute } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/transactions/status-badge';
import { formatDate } from '@/lib/utils';
import { ResolveForm } from './resolve-form';

async function DisputeDetail({ id }: { id: string }) {
  const dispute = await getDispute(id);
  const isResolved = !!dispute.resolution;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dispute Details</h1>
        <Badge variant={isResolved ? 'secondary' : 'destructive'}>
          {isResolved ? 'Resolved' : 'Open'}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dispute Information</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div className="col-span-2">
              <dt className="text-gray-500">Reason</dt>
              <dd className="mt-1">{dispute.reason}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Filed By</dt>
              <dd>{dispute.filedBy?.name || dispute.filedById}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Filed On</dt>
              <dd>{formatDate(dispute.createdAt)}</dd>
            </div>
            {dispute.evidence && (
              <div className="col-span-2">
                <dt className="text-gray-500">Evidence</dt>
                <dd className="mt-1 whitespace-pre-wrap">{dispute.evidence}</dd>
              </div>
            )}
            {dispute.resolution && (
              <div className="col-span-2">
                <dt className="text-gray-500">Resolution</dt>
                <dd className="mt-1">{dispute.resolution}</dd>
              </div>
            )}
          </dl>
        </CardContent>
      </Card>

      {dispute.transaction && (
        <Card>
          <CardHeader>
            <CardTitle>Related Transaction</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Link
                href={`/transactions/${dispute.transactionId}`}
                className="font-medium hover:underline"
              >
                {dispute.transaction.title}
              </Link>
              <StatusBadge status={dispute.transaction.status} />
            </div>
          </CardContent>
        </Card>
      )}

      {!isResolved && (
        <Card>
          <CardHeader>
            <CardTitle>Resolve Dispute</CardTitle>
          </CardHeader>
          <CardContent>
            <ResolveForm disputeId={dispute.id} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default async function DisputeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div>
      <Link href="/disputes" className="text-sm text-blue-600 hover:underline mb-4 inline-block">
        Back to Disputes
      </Link>
      <Suspense
        fallback={
          <div role="status" className="flex flex-col gap-4">
            <div className="h-8 bg-gray-200 rounded w-48 animate-pulse" />
            <div className="h-40 bg-gray-200 rounded animate-pulse" />
            <span className="sr-only">Loading dispute details...</span>
          </div>
        }
      >
        <DisputeDetail id={id} />
      </Suspense>
    </div>
  );
}
