import { redirect } from 'next/navigation';
import { getCurrentUser, fetchWithAuth } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import WorkOrderForm from './work-order-form';
import type { WorkOrder, Customer, Technician } from '@/lib/types';

export default async function WorkOrdersPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  let workOrders: WorkOrder[] = [];
  let customers: Customer[] = [];
  let technicians: Technician[] = [];

  const [woRes, custRes, techRes] = await Promise.all([
    fetchWithAuth('/work-orders'),
    fetchWithAuth('/customers'),
    fetchWithAuth('/technicians'),
  ]);

  if (woRes.ok) workOrders = await woRes.json();
  if (custRes.ok) customers = await custRes.json();
  if (techRes.ok) technicians = await techRes.json();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Work Orders</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button>New Work Order</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Work Order</DialogTitle>
            </DialogHeader>
            <WorkOrderForm customers={customers} technicians={technicians} />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Work Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {workOrders.length === 0 ? (
            <p className="text-muted-foreground">No work orders found.</p>
          ) : (
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
                {workOrders.map((wo) => (
                  <TableRow key={wo.id}>
                    <TableCell className="font-medium">{wo.title}</TableCell>
                    <TableCell>{wo.customer?.name || '—'}</TableCell>
                    <TableCell>{wo.technician?.user.email || '—'}</TableCell>
                    <TableCell>{wo.priority}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          wo.status === 'COMPLETED'
                            ? 'success'
                            : wo.status === 'ON_HOLD'
                              ? 'warning'
                              : wo.status === 'IN_PROGRESS'
                                ? 'default'
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
