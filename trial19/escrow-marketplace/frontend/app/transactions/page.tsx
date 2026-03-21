import Link from 'next/link';
import { fetchTransactions } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { TransactionStatus } from '@/lib/types';

const STATUS_VARIANT: Record<TransactionStatus, 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning'> = {
  PENDING: 'warning',
  FUNDED: 'default',
  SHIPPED: 'secondary',
  DELIVERED: 'default',
  RELEASED: 'success',
  DISPUTED: 'destructive',
  RESOLVED: 'outline',
  REFUNDED: 'destructive',
};

export default async function TransactionsPage() {
  const transactions = await fetchTransactions();

  return (
    <div className="space-y-6" aria-live="polite">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Transactions</h1>
        <Button asChild>
          <Link href="/transactions/create">New Transaction</Link>
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((tx) => (
            <TableRow key={tx.id}>
              <TableCell className="font-medium">{tx.title}</TableCell>
              <TableCell>${tx.amount}</TableCell>
              <TableCell>
                <Badge variant={STATUS_VARIANT[tx.status]}>{tx.status}</Badge>
              </TableCell>
              <TableCell>{new Date(tx.createdAt).toLocaleDateString()}</TableCell>
              <TableCell>
                <Button asChild variant="ghost" size="sm">
                  <Link href={`/transactions/${tx.id}`}>View</Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {transactions.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                No transactions found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
