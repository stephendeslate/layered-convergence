import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CreateTransactionDialog } from './create-transaction-dialog';
import { UpdateStatusDialog } from './update-status-dialog';
import type { Transaction } from '@/lib/types';

const API_URL = process.env.API_URL || 'http://localhost:3001';

function getStatusVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'RELEASED':
      return 'default';
    case 'DISPUTED':
    case 'REFUNDED':
      return 'destructive';
    case 'PENDING':
      return 'outline';
    default:
      return 'secondary';
  }
}

export default async function TransactionsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) redirect('/login');

  const userCookie = cookieStore.get('user')?.value;
  let currentUser: { id: string; role: string } | null = null;
  if (userCookie) {
    try {
      currentUser = JSON.parse(userCookie);
    } catch {
      currentUser = null;
    }
  }

  const response = await fetch(`${API_URL}/transactions`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });

  let transactions: Transaction[] = [];
  if (response.ok) {
    transactions = await response.json();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Transactions</h1>
        {currentUser?.role === 'BUYER' && <CreateTransactionDialog />}
      </div>

      {transactions.length === 0 ? (
        <p className="text-muted-foreground">No transactions found.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Description</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Buyer</TableHead>
              <TableHead>Seller</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((tx) => (
              <TableRow key={tx.id}>
                <TableCell className="font-medium">{tx.description}</TableCell>
                <TableCell>${tx.amount}</TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(tx.status)}>{tx.status}</Badge>
                </TableCell>
                <TableCell>{tx.buyer?.email}</TableCell>
                <TableCell>{tx.seller?.email}</TableCell>
                <TableCell>{new Date(tx.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  <UpdateStatusDialog
                    transaction={tx}
                    userRole={currentUser?.role ?? ''}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
