import { Card, CardHeader, CardTitle, CardContent } from '../../../../components/ui/card';
import { Badge } from '../../../../components/ui/badge';
import { PRIORITIES } from '@field-service-dispatch/shared';

// TRACED: FD-REQ-WO-003 — Work orders page using shared constants
export default function WorkOrdersPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Work Orders</h1>
      <Card>
        <CardHeader>
          <CardTitle>Priority Levels</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            {PRIORITIES.map((p) => (
              <Badge key={p} variant={p === 'URGENT' ? 'destructive' : 'secondary'}>
                {p}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
