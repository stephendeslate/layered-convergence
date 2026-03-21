import Link from 'next/link';
import type { Transaction } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { StatusBadge } from './status-badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface TransactionCardProps {
  transaction: Transaction;
}

export function TransactionCard({ transaction }: TransactionCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>
            <Link
              href={`/transactions/${transaction.id}`}
              className="hover:underline"
            >
              {transaction.title}
            </Link>
          </CardTitle>
          <StatusBadge status={transaction.status} />
        </div>
      </CardHeader>
      <CardContent>
        <dl className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <dt className="text-gray-500">Amount</dt>
            <dd className="font-medium">{formatCurrency(transaction.amount)}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Platform Fee</dt>
            <dd className="font-medium">{formatCurrency(transaction.platformFee)}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Buyer</dt>
            <dd>{transaction.buyer?.name || transaction.buyerId}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Seller</dt>
            <dd>{transaction.seller?.name || transaction.sellerId}</dd>
          </div>
          <div className="col-span-2">
            <dt className="text-gray-500">Created</dt>
            <dd>{formatDate(transaction.createdAt)}</dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}
