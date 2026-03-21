import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function TransactionDetailPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Transaction Detail</h1>
        <Badge variant="secondary">PENDING</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transaction Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-[var(--muted-foreground)]">Amount</p>
              <p className="text-lg font-semibold">$0.00</p>
            </div>
            <div>
              <p className="text-sm text-[var(--muted-foreground)]">Status</p>
              <p className="text-lg font-semibold">Pending</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm">Fund</Button>
            <Button size="sm" variant="outline">Ship</Button>
            <Button size="sm" variant="destructive">Dispute</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
