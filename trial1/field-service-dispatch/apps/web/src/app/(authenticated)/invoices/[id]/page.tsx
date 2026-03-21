'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { INVOICE_STATUS_COLORS } from '@/lib/constants';
import { api } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { InvoiceDto } from '@fsd/shared';

export default function InvoiceDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [invoice, setInvoice] = useState<InvoiceDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.get<InvoiceDto>(`/invoices/${id}`)
      .then(setInvoice)
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [id]);

  const handleSend = async () => {
    try {
      await api.post(`/invoices/${id}/send`);
      const updated = await api.get<InvoiceDto>(`/invoices/${id}`);
      setInvoice(updated);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to send');
    }
  };

  const handleMarkPaid = async () => {
    try {
      await api.post(`/invoices/${id}/mark-paid`);
      const updated = await api.get<InvoiceDto>(`/invoices/${id}`);
      setInvoice(updated);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to mark as paid');
    }
  };

  if (isLoading || !invoice) {
    return (
      <div className="p-6 space-y-4">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="h-64 bg-gray-200 rounded animate-pulse" />
      </div>
    );
  }

  const colors = INVOICE_STATUS_COLORS[invoice.status];
  const nonTaxItems = invoice.lineItems.filter((li) => li.type !== 'TAX');

  return (
    <div className="p-4 lg:p-6 max-w-4xl mx-auto space-y-6">
      <Link href="/invoices" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Back to Invoices
      </Link>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">Invoice {invoice.invoiceNumber}</h1>
          <Badge className={`${colors.bg} ${colors.text} border-0 text-sm`}>
            {invoice.status}
          </Badge>
        </div>
        <div className="flex gap-2">
          {invoice.status === 'DRAFT' && (
            <Button onClick={handleSend}>Send to Customer</Button>
          )}
          {invoice.status === 'SENT' && (
            <Button variant="success" onClick={handleMarkPaid}>Mark Paid</Button>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-gray-500">Invoice Details</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500">Invoice Date</span>
              <span className="font-medium">{formatDate(invoice.createdAt)}</span>
            </div>
            {invoice.dueDate && (
              <div className="flex justify-between">
                <span className="text-gray-500">Due Date</span>
                <span className="font-medium">{formatDate(invoice.dueDate)}</span>
              </div>
            )}
            {invoice.sentAt && (
              <div className="flex justify-between">
                <span className="text-gray-500">Sent</span>
                <span className="font-medium">{formatDate(invoice.sentAt)}</span>
              </div>
            )}
            {invoice.paidAt && (
              <div className="flex justify-between">
                <span className="text-gray-500">Paid</span>
                <span className="font-medium">{formatDate(invoice.paidAt)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-500">Work Order</span>
              <Link href={`/work-orders/${invoice.workOrderId}`} className="text-blue-600 hover:underline font-medium">
                View
              </Link>
            </div>
          </CardContent>
        </Card>

        {invoice.notes && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-gray-500">Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{invoice.notes}</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Line Items */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Line Items</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right">Unit Price</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {nonTaxItems.map((li, i) => (
                <TableRow key={li.id}>
                  <TableCell className="text-gray-400">{i + 1}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">{li.type}</Badge>
                  </TableCell>
                  <TableCell>{li.description}</TableCell>
                  <TableCell className="text-right">{li.quantity.toFixed(2)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(li.unitPrice)}</TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(li.totalPrice)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="border-t border-gray-200 px-6 py-4 space-y-2 text-sm">
            <div className="flex justify-end gap-8">
              <span className="text-gray-500">Subtotal</span>
              <span className="font-medium w-28 text-right">{formatCurrency(invoice.subtotal)}</span>
            </div>
            <div className="flex justify-end gap-8">
              <span className="text-gray-500">Tax</span>
              <span className="font-medium w-28 text-right">{formatCurrency(invoice.taxAmount)}</span>
            </div>
            <Separator />
            <div className="flex justify-end gap-8 text-lg font-bold">
              <span>Total</span>
              <span className="w-28 text-right">{formatCurrency(invoice.totalAmount)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {invoice.stripePaymentUrl && (
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <span className="text-sm text-gray-600">Payment link available</span>
            <a
              href={invoice.stripePaymentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline text-sm font-medium"
            >
              View on Stripe
            </a>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
