import { Card, CardHeader, CardTitle, CardContent } from '../../../../components/ui/card';
import { Badge } from '../../../../components/ui/badge';
import { ESCROW_STATUSES } from '@escrow-marketplace/shared';

// TRACED: EM-REQ-ESC-003 — Transaction history page using shared constants
export default function TransactionsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Transaction History</h1>
      <Card>
        <CardHeader>
          <CardTitle>Status Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {ESCROW_STATUSES.map((status) => (
              <Badge
                key={status}
                variant={status === 'CANCELLED' || status === 'REFUNDED' ? 'destructive' : 'outline'}
              >
                {status}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
