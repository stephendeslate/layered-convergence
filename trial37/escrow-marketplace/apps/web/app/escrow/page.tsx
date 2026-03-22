import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { formatCurrency } from '@escrow-marketplace/shared';

export default function EscrowPage() {
  const sampleEscrow = [
    { id: '1', amount: '75.00', status: 'RELEASED', transaction: 'TX-001' },
    { id: '2', amount: '149.50', status: 'HELD', transaction: 'TX-002' },
    { id: '3', amount: '500.00', status: 'REFUNDED', transaction: 'TX-003' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Escrow Accounts</h1>
      <p className="text-gray-600">
        View the status of escrow accounts for your transactions.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {sampleEscrow.map((escrow) => (
          <Card key={escrow.id} className="p-4">
            <div className="flex justify-between items-start mb-3">
              <span className="text-sm text-gray-500">{escrow.transaction}</span>
              <Badge
                variant={
                  escrow.status === 'HELD'
                    ? 'secondary'
                    : escrow.status === 'RELEASED'
                      ? 'default'
                      : 'outline'
                }
              >
                {escrow.status}
              </Badge>
            </div>
            <p className="text-2xl font-bold">{formatCurrency(escrow.amount)}</p>
          </Card>
        ))}
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-3">How Escrow Works</h2>
        <ol className="list-decimal list-inside space-y-2 text-gray-600">
          <li>Buyer initiates a purchase and funds are placed in escrow</li>
          <li>Seller ships or delivers the item to the buyer</li>
          <li>Buyer confirms receipt and satisfaction</li>
          <li>Funds are released from escrow to the seller</li>
        </ol>
      </Card>
    </div>
  );
}
