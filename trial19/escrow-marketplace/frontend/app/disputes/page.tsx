import Link from 'next/link';
import { fetchDisputes } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import type { DisputeStatus } from '@/lib/types';

const STATUS_VARIANT: Record<DisputeStatus, 'default' | 'destructive' | 'outline' | 'success'> = {
  OPEN: 'destructive',
  INVESTIGATING: 'default',
  RESOLVED: 'success',
};

export default async function DisputesPage() {
  const disputes = await fetchDisputes();

  return (
    <div className="space-y-6" aria-live="polite">
      <h1 className="text-3xl font-bold">Disputes</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Reason</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Transaction</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {disputes.map((dispute) => (
            <TableRow key={dispute.id}>
              <TableCell className="font-medium max-w-xs truncate">{dispute.reason}</TableCell>
              <TableCell>
                <Badge variant={STATUS_VARIANT[dispute.status]}>{dispute.status}</Badge>
              </TableCell>
              <TableCell>
                <Link
                  href={`/transactions/${dispute.transactionId}`}
                  className="text-primary hover:underline"
                >
                  View Transaction
                </Link>
              </TableCell>
              <TableCell>{new Date(dispute.createdAt).toLocaleDateString()}</TableCell>
              <TableCell>
                <Button asChild variant="ghost" size="sm">
                  <Link href={`/disputes/${dispute.id}`}>View</Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {disputes.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                No disputes found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
