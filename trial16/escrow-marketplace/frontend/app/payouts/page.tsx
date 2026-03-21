import { Suspense } from 'react';
import { getPayouts } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { cn, getStatusColor, formatCurrency, formatDate } from '@/lib/utils';
import type { Payout } from '@/lib/types';

async function PayoutTable() {
  let payouts: Payout[];
  try {
    payouts = await getPayouts();
  } catch {
    payouts = [];
  }

  if (payouts.length === 0) {
    return (
      <p className="py-8 text-center text-gray-500">No payouts found.</p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Transaction</TableHead>
          <TableHead>Seller</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Date</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {payouts.map((p) => (
          <TableRow key={p.id}>
            <TableCell className="font-medium">
              {p.transaction.title}
            </TableCell>
            <TableCell>{p.user.name}</TableCell>
            <TableCell>{formatCurrency(p.amount)}</TableCell>
            <TableCell>
              <span
                className={cn(
                  'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold',
                  getStatusColor(p.status),
                )}
              >
                {p.status}
              </span>
            </TableCell>
            <TableCell>{formatDate(p.createdAt)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function PayoutTableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="h-12 w-full animate-pulse rounded bg-gray-200"
        />
      ))}
    </div>
  );
}

export default function PayoutsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Payouts</h1>

      <Card>
        <CardHeader>
          <CardTitle>Payout History</CardTitle>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<PayoutTableSkeleton />}>
            <PayoutTable />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
