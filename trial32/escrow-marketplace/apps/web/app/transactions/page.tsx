import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@escrow-marketplace/shared';
import { TRANSACTION_STATUSES } from '@escrow-marketplace/shared';

const mockTransactions = [
  { id: '1', amount: '1500.00', currency: 'USD', status: 'RELEASED', description: 'Custom widget development', buyerId: 'b1', sellerId: 's1' },
  { id: '2', amount: '750.50', currency: 'USD', status: 'DISPUTED', description: 'Logo design project', buyerId: 'b1', sellerId: 's1' },
  { id: '3', amount: '200.00', currency: 'EUR', status: 'REFUNDED', description: 'Translation services', buyerId: 'b1', sellerId: 's1' },
];

function statusVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (status === 'RELEASED') return 'default';
  if (status === 'DISPUTED' || status === 'REFUNDED') return 'destructive';
  if (status === 'FUNDED') return 'secondary';
  return 'outline';
}

export default function TransactionsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Transactions</h1>
      <p className="text-sm text-[var(--muted-foreground)]">
        Valid statuses: {TRANSACTION_STATUSES.join(', ')}
      </p>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Description</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mockTransactions.map((tx) => (
            <TableRow key={tx.id}>
              <TableCell>{tx.description}</TableCell>
              <TableCell>{formatCurrency(Number(tx.amount), tx.currency)}</TableCell>
              <TableCell><Badge variant={statusVariant(tx.status)}>{tx.status}</Badge></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
