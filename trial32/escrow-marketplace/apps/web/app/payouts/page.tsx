import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@escrow-marketplace/shared';

const mockPayouts = [
  { id: '1', amount: '1500.00', currency: 'USD', recipientId: 's1', processedAt: '2024-01-15T10:00:00Z' },
  { id: '2', amount: '375.25', currency: 'USD', recipientId: 's1', processedAt: null },
];

export default function PayoutsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Payouts</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Amount</TableHead>
            <TableHead>Recipient</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mockPayouts.map((p) => (
            <TableRow key={p.id}>
              <TableCell>{formatCurrency(Number(p.amount), p.currency)}</TableCell>
              <TableCell>{p.recipientId}</TableCell>
              <TableCell>
                <Badge variant={p.processedAt ? 'default' : 'outline'}>
                  {p.processedAt ? 'Processed' : 'Pending'}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
