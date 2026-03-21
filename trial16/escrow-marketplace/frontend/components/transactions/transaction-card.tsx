import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { StatusBadge } from './status-badge';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Transaction } from '@/lib/types';

interface TransactionCardProps {
  transaction: Transaction;
}

export function TransactionCard({ transaction }: TransactionCardProps) {
  return (
    <Card data-testid="transaction-card">
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">{transaction.title}</CardTitle>
          <StatusBadge status={transaction.status} />
        </div>
      </CardHeader>
      <CardContent>
        <dl className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <dt className="text-gray-500">Amount</dt>
            <dd className="font-semibold">
              {formatCurrency(transaction.amount)}
            </dd>
          </div>
          <div>
            <dt className="text-gray-500">Created</dt>
            <dd>{formatDate(transaction.createdAt)}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Buyer</dt>
            <dd>{transaction.buyer.name}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Seller</dt>
            <dd>{transaction.seller.name}</dd>
          </div>
        </dl>
        {transaction.description && (
          <p className="mt-3 text-sm text-gray-600">{transaction.description}</p>
        )}
      </CardContent>
      <CardFooter>
        <Link
          href={`/transactions/${transaction.id}`}
          className="text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          View details
        </Link>
      </CardFooter>
    </Card>
  );
}
