import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';

export default function DisputesPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Disputes</h1>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Reason</TableHead>
            <TableHead>Transaction</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Filed</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell colSpan={5} className="text-center text-[var(--muted-foreground)]">
              No disputes found.
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}
