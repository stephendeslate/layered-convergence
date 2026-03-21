import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default async function TransactionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Transaction Details</h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Transaction {id}</span>
            <Badge>PENDING</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-[var(--muted-foreground)]">Amount</p>
              <p className="font-semibold">$0.00</p>
            </div>
            <div>
              <p className="text-sm text-[var(--muted-foreground)]">Status</p>
              <p className="font-semibold">Pending</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button>Fund Transaction</Button>
            <Button variant="destructive">Open Dispute</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
