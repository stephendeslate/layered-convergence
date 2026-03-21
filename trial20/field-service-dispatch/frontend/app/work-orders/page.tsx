import { redirect } from 'next/navigation';
import { getCurrentUser, fetchWithAuth } from '@/lib/auth';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import type { WorkOrder } from '@/lib/types';
import { WorkOrderForm } from './work-order-form';

function getStatusVariant(status: string) {
  switch (status) {
    case 'COMPLETED': return 'success' as const;
    case 'ON_HOLD': return 'warning' as const;
    case 'IN_PROGRESS': return 'default' as const;
    case 'INVOICED': return 'outline' as const;
    default: return 'secondary' as const;
  }
}

export default async function WorkOrdersPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  let workOrders: WorkOrder[] = [];
  const response = await fetchWithAuth('/work-orders');
  if (response.ok) {
    workOrders = await response.json();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Work Orders</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button>Create Work Order</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Work Order</DialogTitle>
            </DialogHeader>
            <WorkOrderForm />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Technician</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {workOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No work orders yet.
                  </TableCell>
                </TableRow>
              ) : (
                workOrders.map((wo) => (
                  <TableRow key={wo.id}>
                    <TableCell className="font-medium">{wo.title}</TableCell>
                    <TableCell>{wo.customer?.name}</TableCell>
                    <TableCell>{wo.technician?.user?.email || 'Unassigned'}</TableCell>
                    <TableCell>{wo.priority}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(wo.status)}>{wo.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
