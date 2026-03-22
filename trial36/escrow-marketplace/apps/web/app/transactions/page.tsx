import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { formatCurrency } from '@escrow-marketplace/shared';

interface TransactionItem {
  id: string;
  amount: string;
  status: string;
  listing?: { title: string };
  createdAt: string;
}

export default async function TransactionsPage() {
  let transactions: TransactionItem[] = [];

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const response = await fetch(
      `${apiUrl}/transactions?page=1&pageSize=20`,
      { cache: 'no-store' },
    );

    if (response.ok) {
      const data = await response.json();
      transactions = data.data || [];
    }
  } catch {
    transactions = [];
  }

  const statusVariant = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'default' as const;
      case 'DISPUTED':
        return 'destructive' as const;
      case 'PENDING':
        return 'secondary' as const;
      default:
        return 'outline' as const;
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Transactions</h1>

      {transactions.length === 0 ? (
        <Card className="p-6 text-center">
          <p className="text-gray-500">No transactions found.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {transactions.map((tx) => (
            <Card key={tx.id} className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="font-semibold">
                    {tx.listing?.title || 'Unknown Listing'}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {new Date(tx.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-lg font-bold">
                    {formatCurrency(tx.amount)}
                  </span>
                  <Badge variant={statusVariant(tx.status)}>
                    {tx.status}
                  </Badge>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
