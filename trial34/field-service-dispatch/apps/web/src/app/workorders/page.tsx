import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../../components/ui/table';
import { Badge } from '../../../../components/ui/badge';
import { truncate, WORK_ORDER_STATUSES } from '@field-service-dispatch/shared';
import { fetchWorkOrders } from '../../../../actions/workorder-actions';

// TRACED: FD-UI-WO-001 — Work orders page with shared imports
// TRACED: FD-CQ-TRUNC-003 — truncate used in work orders page
export default async function WorkOrdersPage() {
  const workOrders = await fetchWorkOrders();

  return (
    <div className="container mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold mb-6">Work Orders</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {workOrders.map((wo: { id: string; title: string; priority: string; status: string }) => (
            <TableRow key={wo.id}>
              <TableCell>{truncate(wo.title, 40)}</TableCell>
              <TableCell>
                <Badge
                  variant={
                    wo.priority === 'URGENT'
                      ? 'destructive'
                      : wo.priority === 'HIGH'
                        ? 'default'
                        : 'secondary'
                  }
                >
                  {wo.priority}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    wo.status === 'COMPLETED'
                      ? 'default'
                      : wo.status === 'CANCELLED'
                        ? 'destructive'
                        : 'secondary'
                  }
                >
                  {wo.status}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
