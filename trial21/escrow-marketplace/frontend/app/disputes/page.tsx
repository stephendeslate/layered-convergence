import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CreateDisputeDialog } from './create-dispute-dialog';
import { ResolveDisputeDialog } from './resolve-dispute-dialog';
import type { Dispute } from '@/lib/types';

const API_URL = process.env.API_URL || 'http://localhost:3001';

// [TRACED:UI-008] Disputes page with Table component and status-based badge variants
export default async function DisputesPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) redirect('/login');

  const response = await fetch(`${API_URL}/disputes`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });

  let disputes: Dispute[] = [];
  if (response.ok) {
    disputes = await response.json();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Disputes</h1>
        <CreateDisputeDialog />
      </div>

      {disputes.length === 0 ? (
        <p className="text-muted-foreground">No disputes found.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Transaction</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Resolution</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {disputes.map((dispute) => (
              <TableRow key={dispute.id}>
                <TableCell className="font-medium">
                  {dispute.transaction?.description ?? dispute.transactionId}
                </TableCell>
                <TableCell>{dispute.reason}</TableCell>
                <TableCell>
                  <Badge
                    variant={dispute.status === 'OPEN' ? 'destructive' : 'default'}
                  >
                    {dispute.status}
                  </Badge>
                </TableCell>
                <TableCell>{dispute.resolution ?? '-'}</TableCell>
                <TableCell>{new Date(dispute.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  {dispute.status === 'OPEN' && (
                    <ResolveDisputeDialog disputeId={dispute.id} />
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
