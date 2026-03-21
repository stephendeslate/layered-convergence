import { Suspense } from 'react';
import { getPayouts } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate } from '@/lib/utils';

async function PayoutsList() {
  const payouts = await getPayouts();

  if (payouts.length === 0) {
    return (
      <p className="text-gray-500 py-8 text-center">
        No payouts found.
      </p>
    );
  }

  return (
    <div className="grid gap-4">
      {payouts.map((payout) => (
        <Card key={payout.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">
                Payout for {payout.transaction?.title || payout.transactionId}
              </CardTitle>
              <Badge
                variant={
                  payout.status === 'COMPLETED'
                    ? 'default'
                    : payout.status === 'FAILED'
                      ? 'destructive'
                      : 'secondary'
                }
              >
                {payout.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-3 gap-2 text-sm">
              <div>
                <dt className="text-gray-500">Amount</dt>
                <dd className="font-medium">{formatCurrency(payout.amount)}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Platform Fee</dt>
                <dd className="font-medium">{formatCurrency(payout.platformFee)}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Created</dt>
                <dd>{formatDate(payout.createdAt)}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function PayoutsPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold">Payouts</h1>
      <Suspense
        fallback={
          <div role="status" className="flex flex-col gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded animate-pulse" />
            ))}
            <span className="sr-only">Loading payouts...</span>
          </div>
        }
      >
        <PayoutsList />
      </Suspense>
    </div>
  );
}
