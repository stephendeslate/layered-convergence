import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function DisputeDetailPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dispute Detail</h1>
        <Badge variant="destructive">OPEN</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dispute Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-[var(--muted-foreground)]">Reason</p>
            <p className="text-lg">Item not as described</p>
          </div>
          <div>
            <p className="text-sm text-[var(--muted-foreground)]">Transaction</p>
            <p className="text-lg">-</p>
          </div>
          <Button variant="outline">Resolve Dispute</Button>
        </CardContent>
      </Card>
    </div>
  );
}
