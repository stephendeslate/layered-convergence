import { cookies } from 'next/headers';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { Invoice } from '@/lib/types';

const API_URL = process.env.API_URL ?? 'http://localhost:3001';

async function fetchInvoices(): Promise<Invoice[]> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return [];

  const res = await fetch(`${API_URL}/invoices`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    next: { revalidate: 0 },
  });

  if (!res.ok) throw new Error('Failed to fetch invoices');
  return res.json() as Promise<Invoice[]>;
}

export default async function InvoicesPage() {
  const invoices = await fetchInvoices();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Invoices</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Invoice ID</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Tax</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Work Order</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((invoice) => (
            <TableRow key={invoice.id}>
              <TableCell className="font-medium font-mono text-sm">{invoice.id.slice(0, 8)}</TableCell>
              <TableCell>${invoice.amount}</TableCell>
              <TableCell>${invoice.tax}</TableCell>
              <TableCell className="font-medium">${invoice.total}</TableCell>
              <TableCell>
                <a href={`/work-orders/${invoice.workOrderId}`} className="text-primary hover:underline">
                  {invoice.workOrderId.slice(0, 8)}
                </a>
              </TableCell>
            </TableRow>
          ))}
          {invoices.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground">
                No invoices found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
