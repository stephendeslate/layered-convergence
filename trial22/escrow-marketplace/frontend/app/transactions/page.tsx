'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { apiFetch } from '@/lib/api';

interface Transaction {
  id: string;
  buyerId: string;
  sellerId: string;
  amount: string;
  description: string;
  status: string;
  createdAt: string;
}

function statusVariant(
  status: string,
): 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' {
  switch (status) {
    case 'COMPLETED':
      return 'success';
    case 'DISPUTE':
      return 'destructive';
    case 'REFUNDED':
      return 'warning';
    case 'PENDING':
      return 'outline';
    default:
      return 'secondary';
  }
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTransactions() {
      const response = await apiFetch('/transactions');
      if (response.ok) {
        const data = await response.json();
        setTransactions(data);
      }
      setLoading(false);
    }
    fetchTransactions();
  }, []);

  if (loading) {
    return (
      <div role="status" aria-busy="true">
        <p>Loading transactions...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Transactions</h1>
        <Link href="/transactions/new">
          <Button>New Transaction</Button>
        </Link>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Description</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((tx) => (
            <TableRow key={tx.id}>
              <TableCell>{tx.description}</TableCell>
              <TableCell>${tx.amount}</TableCell>
              <TableCell>
                <Badge variant={statusVariant(tx.status)}>{tx.status}</Badge>
              </TableCell>
              <TableCell>
                {new Date(tx.createdAt).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <Link href={`/transactions/${tx.id}`}>
                  <Button variant="ghost" size="sm">
                    View
                  </Button>
                </Link>
              </TableCell>
            </TableRow>
          ))}
          {transactions.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground">
                No transactions found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
