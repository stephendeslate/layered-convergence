import { redirect } from 'next/navigation';
import { getCurrentUser, fetchWithAuth } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import InvoiceForm from './invoice-form';
import type { Invoice, WorkOrder } from '@/lib/types';

export default async function InvoicesPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  let invoices: Invoice[] = [];
  let workOrders: WorkOrder[] = [];

  const [invRes, woRes] = await Promise.all([
    fetchWithAuth('/invoices'),
    fetchWithAuth('/work-orders'),
  ]);

  if (invRes.ok) invoices = await invRes.json();
  if (woRes.ok) workOrders = await woRes.json();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Invoices</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button>New Invoice</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Invoice</DialogTitle>
            </DialogHeader>
            <InvoiceForm workOrders={workOrders} />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <p className="text-muted-foreground">No invoices found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Work Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Tax</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell className="font-medium">
                      {inv.workOrder?.title || inv.workOrderId}
                    </TableCell>
                    <TableCell>{inv.workOrder?.customer?.name || '—'}</TableCell>
                    <TableCell>${inv.amount}</TableCell>
                    <TableCell>${inv.tax}</TableCell>
                    <TableCell className="font-bold">${inv.total}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          inv.status === 'PAID'
                            ? 'success'
                            : inv.status === 'OVERDUE'
                              ? 'warning'
                              : 'secondary'
                        }
                      >
                        {inv.status}
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
