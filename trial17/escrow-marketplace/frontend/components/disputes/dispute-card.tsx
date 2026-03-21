import Link from 'next/link';
import type { Dispute } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface DisputeCardProps {
  dispute: Dispute;
}

export function DisputeCard({ dispute }: DisputeCardProps) {
  const isResolved = !!dispute.resolution;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>
            <Link
              href={`/disputes/${dispute.id}`}
              className="hover:underline"
            >
              Dispute: {dispute.transaction?.title || dispute.transactionId}
            </Link>
          </CardTitle>
          <Badge variant={isResolved ? 'secondary' : 'destructive'}>
            {isResolved ? 'Resolved' : 'Open'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <dl className="grid grid-cols-2 gap-2 text-sm">
          <div className="col-span-2">
            <dt className="text-gray-500">Reason</dt>
            <dd>{dispute.reason}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Filed By</dt>
            <dd>{dispute.filedBy?.name || dispute.filedById}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Filed On</dt>
            <dd>{formatDate(dispute.createdAt)}</dd>
          </div>
          {dispute.resolution && (
            <div className="col-span-2">
              <dt className="text-gray-500">Resolution</dt>
              <dd>{dispute.resolution}</dd>
            </div>
          )}
        </dl>
      </CardContent>
    </Card>
  );
}
