import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { fetchInvoices } from '@/app/actions';
import { formatCurrency } from '@field-service-dispatch/shared';

export default async function InvoicesPage() {
  let invoices: Awaited<ReturnType<typeof fetchInvoices>> = [];

  try {
    invoices = await fetchInvoices();
  } catch {
    invoices = [];
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Invoices</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Invoice ID</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Currency</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Work Order</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((invoice) => (
            <TableRow key={invoice.id}>
              <TableCell className="font-medium">{invoice.id.slice(0, 8)}</TableCell>
              <TableCell>{formatCurrency(Number(invoice.amount), invoice.currency)}</TableCell>
              <TableCell>{invoice.currency}</TableCell>
              <TableCell>
                <Badge variant={invoice.paidAt ? 'default' : 'outline'}>
                  {invoice.paidAt ? 'Paid' : 'Unpaid'}
                </Badge>
              </TableCell>
              <TableCell>{invoice.workOrderId}</TableCell>
            </TableRow>
          ))}
          {invoices.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-[var(--muted-foreground)]">No invoices found</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
