import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export default function PayoutsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Payouts</h1>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Transaction</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell colSpan={5} className="text-center text-[var(--muted-foreground)]">
              No payouts found. Complete a transaction to request a payout.
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}
