import { fetchDispute } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResolveDisputeForm } from './resolve-form';
import type { DisputeStatus } from '@/lib/types';

const STATUS_VARIANT: Record<DisputeStatus, 'default' | 'destructive' | 'outline' | 'success'> = {
  OPEN: 'destructive',
  INVESTIGATING: 'default',
  RESOLVED: 'success',
};

export default async function DisputeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const dispute = await fetchDispute(id);

  return (
    <div className="max-w-2xl mx-auto space-y-6" aria-live="polite">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dispute Details</h1>
        <Badge variant={STATUS_VARIANT[dispute.status]}>{dispute.status}</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Reason</p>
            <p>{dispute.reason}</p>
          </div>
          {dispute.resolution && (
            <div>
              <p className="text-sm text-muted-foreground">Resolution</p>
              <p>{dispute.resolution}</p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Buyer</p>
              <p className="text-sm">{dispute.buyer?.email ?? dispute.buyerId}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Seller</p>
              <p className="text-sm">{dispute.seller?.email ?? dispute.sellerId}</p>
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Created</p>
            <p>{new Date(dispute.createdAt).toLocaleString()}</p>
          </div>
        </CardContent>
      </Card>

      {dispute.status !== 'RESOLVED' && (
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
