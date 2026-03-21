import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DISPUTE_STATUSES } from '@escrow-marketplace/shared';

const mockDisputes = [
  { id: '1', reason: 'Deliverable does not match specifications', status: 'RESOLVED', resolution: 'Partial refund of 50% agreed upon' },
  { id: '2', reason: 'Late delivery', status: 'OPEN', resolution: null },
];

function statusVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (status === 'RESOLVED') return 'default';
  if (status === 'ESCALATED') return 'destructive';
  if (status === 'UNDER_REVIEW') return 'secondary';
  return 'outline';
}

export default function DisputesPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Disputes</h1>
      <p className="text-sm text-[var(--muted-foreground)]">
        Valid statuses: {DISPUTE_STATUSES.join(', ')}
      </p>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Reason</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Resolution</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mockDisputes.map((d) => (
            <TableRow key={d.id}>
              <TableCell>{d.reason}</TableCell>
              <TableCell><Badge variant={statusVariant(d.status)}>{d.status}</Badge></TableCell>
              <TableCell>{d.resolution ?? '—'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
