// TRACED: FD-UI-WO-001 — Work orders page
import { Card, CardHeader, CardTitle, CardContent } from '../../../../components/ui/card';
import { Badge } from '../../../../components/ui/badge';
import { Button } from '../../../../components/ui/button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../../components/ui/table';
import { formatCoordinates } from '@field-service-dispatch/shared';

export default function WorkOrdersPage() {
  const workOrders = [
    { id: 'wo_1', title: 'HVAC Repair', status: 'OPEN', priority: 'HIGH', lat: '40.7128', lng: '-74.0060' },
    { id: 'wo_2', title: 'Plumbing Install', status: 'ASSIGNED', priority: 'MEDIUM', lat: '34.0522', lng: '-118.2437' },
    { id: 'wo_3', title: 'Electrical Check', status: 'COMPLETED', priority: 'LOW', lat: '41.8781', lng: '-87.6298' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Work Orders</h1>
        <Button>Create Work Order</Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>All Work Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Location</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {workOrders.map((wo) => (
                <TableRow key={wo.id}>
                  <TableCell className="font-medium">{wo.title}</TableCell>
                  <TableCell>
                    <Badge variant={wo.status === 'COMPLETED' ? 'secondary' : 'default'}>
                      {wo.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={wo.priority === 'HIGH' ? 'destructive' : 'outline'}>
                      {wo.priority}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-[var(--muted-foreground)]">
                    {formatCoordinates(wo.lat, wo.lng)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
