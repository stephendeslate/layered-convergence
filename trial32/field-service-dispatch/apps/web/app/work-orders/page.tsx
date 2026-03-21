import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { fetchWorkOrders } from '@/app/actions';
import { WORK_ORDER_STATUSES } from '@field-service-dispatch/shared';

const statusVariants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  PENDING: 'outline',
  ASSIGNED: 'secondary',
  IN_PROGRESS: 'default',
  COMPLETED: 'default',
  CANCELLED: 'destructive',
};

export default async function WorkOrdersPage() {
  let workOrders: Awaited<ReturnType<typeof fetchWorkOrders>> = [];

  try {
    workOrders = await fetchWorkOrders();
  } catch {
    workOrders = [];
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Work Orders</h1>
      <p className="text-sm text-[var(--muted-foreground)] mb-4">
        Valid statuses: {WORK_ORDER_STATUSES.join(', ')}
      </p>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Scheduled</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {workOrders.map((wo) => (
            <TableRow key={wo.id}>
              <TableCell className="font-medium">{wo.title}</TableCell>
              <TableCell>
                <Badge variant={statusVariants[wo.status] ?? 'outline'}>{wo.status}</Badge>
              </TableCell>
              <TableCell>{wo.priority}</TableCell>
              <TableCell>{wo.customerId}</TableCell>
              <TableCell>{wo.scheduledAt ?? 'Not scheduled'}</TableCell>
            </TableRow>
          ))}
          {workOrders.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-[var(--muted-foreground)]">No work orders found</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
