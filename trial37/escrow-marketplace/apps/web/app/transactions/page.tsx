import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Table } from '../../components/ui/table';
import { formatCurrency, truncateText } from '@escrow-marketplace/shared';

export default function TransactionsPage() {
  const sampleTransactions = [
    { id: '1', amount: '75.00', status: 'COMPLETED', listing: 'Art Print Collection' },
    { id: '2', amount: '149.50', status: 'DISPUTED', listing: 'Leather Bag' },
    { id: '3', amount: '500.00', status: 'FAILED', listing: 'Failed Purchase Item' },
  ];

  const statusVariant = (status: string) => {
    if (status === 'COMPLETED') return 'default' as const;
    if (status === 'DISPUTED' || status === 'FAILED') return 'destructive' as const;
    return 'secondary' as const;
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Transactions</h1>

      <Table>
        <thead>
          <tr>
            <th className="text-left p-3">Listing</th>
            <th className="text-left p-3">Amount</th>
            <th className="text-left p-3">Status</th>
          </tr>
        </thead>
        <tbody>
          {sampleTransactions.map((tx) => (
            <tr key={tx.id} className="border-t">
              <td className="p-3">{truncateText(tx.listing, 30)}</td>
              <td className="p-3">{formatCurrency(tx.amount)}</td>
              <td className="p-3">
                <Badge variant={statusVariant(tx.status)}>{tx.status}</Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {sampleTransactions.map((tx) => (
          <Card key={tx.id} className="p-4">
            <h3 className="font-semibold mb-2">{tx.listing}</h3>
            <div className="flex justify-between items-center">
              <span className="font-bold">{formatCurrency(tx.amount)}</span>
              <Badge variant={statusVariant(tx.status)}>{tx.status}</Badge>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
