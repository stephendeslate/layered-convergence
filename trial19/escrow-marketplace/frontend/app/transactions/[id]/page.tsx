import { fetchTransaction } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TransitionButtons } from '@/components/transition-buttons';
import { DisputeDialog } from '@/components/dispute-dialog';
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

const DISPUTABLE_STATUSES: TransactionStatus[] = ['FUNDED', 'SHIPPED', 'DELIVERED'];

export default async function TransactionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const transaction = await fetchTransaction(id);

  return (
    <div className="max-w-2xl mx-auto space-y-6" aria-live="polite">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{transaction.title}</h1>
        <Badge variant={STATUS_VARIANT[transaction.status]}>{transaction.status}</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transaction Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Amount</p>
              <p className="text-lg font-semibold">${transaction.amount}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <p className="text-lg">{transaction.status}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Buyer</p>
              <p className="text-sm">{transaction.buyer?.email ?? transaction.buyerId}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Seller</p>
              <p className="text-sm">{transaction.seller?.email ?? transaction.sellerId}</p>
            </div>
          </div>
          {transaction.description && (
            <div>
              <p className="text-sm text-muted-foreground">Description</p>
              <p>{transaction.description}</p>
            </div>
          )}
          <div>
            <p className="text-sm text-muted-foreground">Created</p>
            <p>{new Date(transaction.createdAt).toLocaleString()}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <TransitionButtons
            transactionId={transaction.id}
            currentStatus={transaction.status}
          />
          {DISPUTABLE_STATUSES.includes(transaction.status) && (
            <DisputeDialog transactionId={transaction.id} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
