// TRACED: EM-UI-TXN-001 — Transactions page
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../../components/ui/table';
import { Badge } from '../../../../components/ui/badge';
import { formatCurrency } from '@escrow-marketplace/shared';

export default function TransactionsPage() {
  const transactions = [
    { id: '1', amount: '5000.00', status: 'ESCROWED', listing: 'Premium Domain' },
    { id: '2', amount: '150.00', status: 'RELEASED', listing: 'Design Assets' },
    { id: '3', amount: '25000.00', status: 'PENDING', listing: 'SaaS Business' },
  ];

  const statusVariant = (status: string) => {
    switch (status) {
      case 'RELEASED': return 'default' as const;
      case 'ESCROWED': return 'secondary' as const;
      case 'DISPUTED': return 'destructive' as const;
      default: return 'outline' as const;
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Transactions</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Listing</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((txn) => (
            <TableRow key={txn.id}>
              <TableCell className="font-medium">{txn.listing}</TableCell>
              <TableCell>{formatCurrency(txn.amount)}</TableCell>
              <TableCell>
                <Badge variant={statusVariant(txn.status)}>{txn.status}</Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
