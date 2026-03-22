// TRACED: EM-FE-008 — Transactions page with server actions
import { fetchTransactions } from '@/lib/api';
import { formatCurrency } from '@escrow-marketplace/shared';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

function statusVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'COMPLETED': return 'default';
    case 'PENDING': return 'secondary';
    case 'FAILED': return 'destructive';
    case 'DISPUTED': return 'destructive';
    case 'REFUNDED': return 'outline';
    default: return 'secondary';
  }
}

export default async function TransactionsPage() {
  const transactions = await fetchTransactions();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Transactions</h1>

      {transactions.length === 0 ? (
        <p className="text-[var(--muted-foreground)]">No transactions found.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((txn: { id: string; amount: string; status: string; createdAt: string }) => (
              <TableRow key={txn.id}>
                <TableCell className="font-mono text-sm">
                  {txn.id.slice(0, 8)}
                </TableCell>
                <TableCell>{formatCurrency(txn.amount)}</TableCell>
                <TableCell>
                  <Badge variant={statusVariant(txn.status)}>
                    {txn.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-[var(--muted-foreground)]">
                  {new Date(txn.createdAt).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
