import { redirect } from 'next/navigation';
import { getCurrentUser, fetchWithAuth } from '@/lib/auth';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import type { Invoice } from '@/lib/types';
import { InvoiceForm } from './invoice-form';

function getInvoiceStatusVariant(status: string) {
  switch (status) {
    case 'PAID': return 'success' as const;
    case 'OVERDUE': return 'destructive' as const;
    case 'SENT': return 'default' as const;
    default: return 'secondary' as const;
  }
}

export default async function InvoicesPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  let invoices: Invoice[] = [];
  const response = await fetchWithAuth('/invoices');
  if (response.ok) {
    invoices = await response.json();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Invoices</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button>Create Invoice</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Invoice</DialogTitle>
            </DialogHeader>
            <InvoiceForm />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
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
              {invoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No invoices yet.
                  </TableCell>
                </TableRow>
              ) : (
                invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.workOrder?.title}</TableCell>
                    <TableCell>{invoice.workOrder?.customer?.name}</TableCell>
                    <TableCell>${invoice.amount}</TableCell>
                    <TableCell>${invoice.tax}</TableCell>
                    <TableCell className="font-bold">${invoice.total}</TableCell>
                    <TableCell>
                      <Badge variant={getInvoiceStatusVariant(invoice.status)}>
                        {invoice.status}
                      </Badge>
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
