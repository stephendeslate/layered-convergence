import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default async function WorkOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Work Order Detail</h1>
        <Badge>OPEN</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Work Order {id}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-[var(--muted-foreground)]">Status</p>
            <p>OPEN</p>
          </div>
          <div>
            <p className="text-sm text-[var(--muted-foreground)]">Description</p>
            <p>Work order details will be loaded from the API.</p>
          </div>
          <div className="flex gap-2">
            <Button>Assign Technician</Button>
            <Button variant="destructive">Cancel</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
