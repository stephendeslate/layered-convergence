// TRACED: EM-WESC-001
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { apiFetch, buildPaginationParams } from '@/lib/api';

interface EscrowItem {
  id: string;
  amount: string;
  balance: string;
  status: string;
  transactionId: string;
}

export default function EscrowsPage() {
  const [escrows, setEscrows] = useState<EscrowItem[]>([]);

  useEffect(() => {
    apiFetch<{ data: EscrowItem[] }>(`/escrows${buildPaginationParams()}`)
      .then((res) => setEscrows(res.data))
      .catch(() => setEscrows([]));
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Escrows</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Balance</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {escrows.map((escrow) => (
              <TableRow key={escrow.id}>
                <TableCell>{escrow.id.slice(0, 8)}</TableCell>
                <TableCell>${escrow.amount}</TableCell>
                <TableCell>${escrow.balance}</TableCell>
                <TableCell>
                  <Badge>{escrow.status}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
