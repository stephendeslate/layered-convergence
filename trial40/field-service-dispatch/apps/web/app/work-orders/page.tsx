// TRACED: FD-WO-001 — Work orders list page with status badges
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';

const statusVariant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  OPEN: 'outline',
  IN_PROGRESS: 'default',
  COMPLETED: 'secondary',
  CANCELLED: 'destructive',
  FAILED: 'destructive',
};

interface WorkOrder {
  id: string;
  title: string;
  status: string;
  priority: string;
  createdAt: string;
}

export default function WorkOrdersPage() {
  const workOrders: WorkOrder[] = [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Work Orders</h1>
        <p className="text-[var(--muted-foreground)]">
          Manage and track field service work orders.
        </p>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Created</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {workOrders.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-[var(--muted-foreground)]">
                No work orders found. Connect to the API to load data.
              </TableCell>
            </TableRow>
          ) : (
            workOrders.map((wo) => (
              <TableRow key={wo.id}>
                <TableCell className="font-mono text-sm">{wo.id}</TableCell>
                <TableCell>{wo.title}</TableCell>
                <TableCell>
                  <Badge variant={statusVariant[wo.status] ?? 'outline'}>
                    {wo.status}
                  </Badge>
                </TableCell>
                <TableCell>{wo.priority}</TableCell>
                <TableCell>{new Date(wo.createdAt).toLocaleDateString()}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
