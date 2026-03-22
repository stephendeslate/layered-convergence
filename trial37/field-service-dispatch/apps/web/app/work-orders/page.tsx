// TRACED: UI-WO-001 — Work orders page
// TRACED: FD-UI-WO-001 — Work orders page with truncateText
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/table';
import { formatCoordinates, truncateText } from '@field-service-dispatch/shared';

export default function WorkOrdersPage() {
  const workOrders = [
    { id: 'wo_1', title: 'HVAC Repair', description: 'Central AC unit not cooling properly in the main building', status: 'OPEN', priority: 'HIGH', lat: '40.7128', lng: '-74.0060' },
    { id: 'wo_2', title: 'Plumbing Install', description: 'New water heater installation for suite 200', status: 'ASSIGNED', priority: 'MEDIUM', lat: '34.0522', lng: '-118.2437' },
    { id: 'wo_3', title: 'Electrical Check', description: 'Annual safety inspection for all floors', status: 'COMPLETED', priority: 'LOW', lat: '41.8781', lng: '-87.6298' },
    { id: 'wo_4', title: 'Cancelled Job', description: 'Customer cancelled the scheduled maintenance visit', status: 'CANCELLED', priority: 'LOW', lat: '29.7604', lng: '-95.3698' },
    { id: 'wo_5', title: 'Failed Repair', description: 'Parts unavailable, repair could not be completed on site', status: 'FAILED', priority: 'URGENT', lat: '33.4484', lng: '-112.0740' },
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
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Location</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {workOrders.map((wo) => (
                <TableRow key={wo.id}>
                  <TableCell className="font-medium">{wo.title}</TableCell>
                  <TableCell className="text-sm text-[var(--muted-foreground)]">
                    {truncateText(wo.description, 30)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={wo.status === 'COMPLETED' ? 'secondary' : wo.status === 'FAILED' || wo.status === 'CANCELLED' ? 'destructive' : 'default'}>
                      {wo.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={wo.priority === 'HIGH' || wo.priority === 'URGENT' ? 'destructive' : 'outline'}>
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
