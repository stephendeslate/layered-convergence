import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { cn, getStatusColor, formatDate } from '@/lib/utils';
import type { Dispute } from '@/lib/types';

interface DisputeCardProps {
  dispute: Dispute;
}

export function DisputeCard({ dispute }: DisputeCardProps) {
  return (
    <Card data-testid="dispute-card">
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">
            Dispute for: {dispute.transaction.title}
          </CardTitle>
          <span
            className={cn(
              'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
              getStatusColor(dispute.transaction.status),
            )}
          >
            {dispute.transaction.status}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <dl className="space-y-2 text-sm">
          <div>
            <dt className="text-gray-500">Filed by</dt>
            <dd>{dispute.filedBy.name}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Reason</dt>
            <dd>{dispute.reason}</dd>
          </div>
          {dispute.evidence && (
            <div>
              <dt className="text-gray-500">Evidence</dt>
              <dd>{dispute.evidence}</dd>
            </div>
          )}
          {dispute.resolution && (
            <div>
              <dt className="text-gray-500">Resolution</dt>
              <dd className="font-semibold">{dispute.resolution}</dd>
            </div>
          )}
          <div>
            <dt className="text-gray-500">Filed on</dt>
            <dd>{formatDate(dispute.createdAt)}</dd>
          </div>
        </dl>
      </CardContent>
      <CardFooter>
        <Link
          href={`/disputes/${dispute.id}`}
          className="text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          View details
        </Link>
      </CardFooter>
    </Card>
  );
}
