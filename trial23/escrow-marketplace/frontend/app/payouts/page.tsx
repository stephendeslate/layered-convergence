import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';

// TRACED:PV-005: Monetary amounts use Decimal(12,2) precision
export default function PayoutsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Payouts</h1>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Transaction</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell colSpan={5} className="text-center text-[var(--muted-foreground)]">
              No payouts found.
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}
