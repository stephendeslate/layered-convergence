'use client';

import { useEffect, useState } from 'react';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { apiFetch } from '@/lib/api';

interface Payout {
  id: string;
  transactionId: string;
  recipientId: string;
  amount: string;
  paidAt: string;
}

export default function PayoutsPage() {
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPayouts() {
      const response = await apiFetch('/payouts');
      if (response.ok) {
        const data = await response.json();
        setPayouts(data);
      }
      setLoading(false);
    }
    fetchPayouts();
  }, []);

  if (loading) {
    return (
      <div role="status" aria-busy="true">
        <p>Loading payouts...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Payouts</h1>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Transaction ID</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Paid At</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payouts.map((payout) => (
            <TableRow key={payout.id}>
              <TableCell className="font-mono text-sm">
                {payout.transactionId}
              </TableCell>
              <TableCell>${payout.amount}</TableCell>
              <TableCell>
                {new Date(payout.paidAt).toLocaleString()}
              </TableCell>
            </TableRow>
          ))}
          {payouts.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={3}
                className="text-center text-muted-foreground"
              >
                No payouts found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
