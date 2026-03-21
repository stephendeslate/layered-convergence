import { fetchPayouts } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { PayoutStatus } from '@/lib/types';

const STATUS_VARIANT: Record<PayoutStatus, 'default' | 'secondary' | 'destructive' | 'success' | 'warning'> = {
  PENDING: 'warning',
  PROCESSING: 'default',
  COMPLETED: 'success',
  FAILED: 'destructive',
};

export default async function PayoutsPage() {
  const payouts = await fetchPayouts();

  return (
    <div className="space-y-6" aria-live="polite">
      <h1 className="text-3xl font-bold">Payouts</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Transaction</TableHead>
            <TableHead>Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payouts.map((payout) => (
            <TableRow key={payout.id}>
              <TableCell className="font-medium">${payout.amount}</TableCell>
              <TableCell>
                <Badge variant={STATUS_VARIANT[payout.status]}>{payout.status}</Badge>
              </TableCell>
              <TableCell>{payout.transactionId}</TableCell>
              <TableCell>{new Date(payout.createdAt).toLocaleDateString()}</TableCell>
            </TableRow>
          ))}
          {payouts.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                No payouts found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
