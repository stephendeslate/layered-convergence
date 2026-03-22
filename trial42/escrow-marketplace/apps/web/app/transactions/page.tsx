// TRACED: EM-WTRX-001
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { apiFetch, buildPaginationParams } from '@/lib/api';

interface Transaction {
  id: string;
  amount: string;
  status: string;
  buyerId: string;
  sellerId: string;
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    apiFetch<{ data: Transaction[] }>(`/transactions${buildPaginationParams()}`)
      .then((res) => setTransactions(res.data))
      .catch(() => setTransactions([]));
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((tx) => (
              <TableRow key={tx.id}>
                <TableCell>{tx.id.slice(0, 8)}</TableCell>
                <TableCell>${tx.amount}</TableCell>
                <TableCell>
                  <Badge>{tx.status}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
