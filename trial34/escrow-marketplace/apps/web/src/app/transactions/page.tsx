import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../../components/ui/table';
import { Badge } from '../../../../components/ui/badge';
import { formatCurrency, TRANSACTION_STATUSES } from '@escrow-marketplace/shared';
import { fetchTransactions } from '../../../../actions/transaction-actions';

// TRACED: EM-UI-TXN-001 — Transactions page with shared imports
export default async function TransactionsPage() {
  const transactions = await fetchTransactions();

  return (
    <div className="container mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold mb-6">Transactions</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((t: { id: string; amount: number; status: string }) => (
            <TableRow key={t.id}>
              <TableCell>{t.id.slice(0, 8)}</TableCell>
              <TableCell>{formatCurrency(t.amount)}</TableCell>
              <TableCell>
                <Badge variant={t.status === 'COMPLETED' ? 'default' : t.status === 'DISPUTED' ? 'destructive' : 'secondary'}>
                  {t.status}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
