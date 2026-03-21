import { Card, CardHeader, CardTitle, CardContent } from '../../../../components/ui/card';
import { Badge } from '../../../../components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../../components/ui/table';
import { formatDate, ESCROW_STATUSES } from '@escrow-marketplace/shared';

// TRACED: EM-DM-ESC-001 — Escrow page using shared formatDate + constants
export default function EscrowPage() {
  const now = formatDate(new Date(), 'long');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Escrow Transactions</h1>
        <p className="text-sm text-muted-foreground">As of: {now}</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Active Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Custom artwork commission</TableCell>
                <TableCell>$500.00</TableCell>
                <TableCell><Badge>FUNDED</Badge></TableCell>
                <TableCell>{formatDate(new Date())}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
