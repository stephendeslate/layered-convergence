import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { formatCurrency } from '@escrow-marketplace/shared';

interface EscrowTransaction {
  id: string;
  amount: string;
  status: string;
  listing?: { title: string };
  createdAt: string;
}

export default async function EscrowPage() {
  let escrowTransactions: EscrowTransaction[] = [];

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const response = await fetch(
      `${apiUrl}/transactions?page=1&pageSize=50`,
      { cache: 'no-store' },
    );

    if (response.ok) {
      const data = await response.json();
      const allTransactions: EscrowTransaction[] = data.data || [];
      escrowTransactions = allTransactions.filter(
        (tx) => tx.status === 'PENDING' || tx.status === 'DISPUTED',
      );
    }
  } catch {
    escrowTransactions = [];
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Escrow Accounts</h1>
      <p className="text-gray-600">
        Active escrow accounts for pending and disputed transactions.
      </p>

      {escrowTransactions.length === 0 ? (
        <Card className="p-6 text-center">
          <p className="text-gray-500">No active escrow accounts.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {escrowTransactions.map((tx) => (
            <Card key={tx.id} className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="font-semibold">
                    {tx.listing?.title || 'Unknown Listing'}
                  </h2>
                  <p className="text-sm text-gray-500">
                    Escrow created{' '}
                    {new Date(tx.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-lg font-bold">
                    {formatCurrency(tx.amount)}
                  </span>
                  <Badge
                    variant={
                      tx.status === 'DISPUTED' ? 'destructive' : 'secondary'
                    }
                  >
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
