'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { INVOICE_STATUS_COLORS } from '@/lib/constants';
import { api } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { InvoiceStatus } from '@fsd/shared';
import type { InvoiceDto, PaginatedResponse } from '@fsd/shared';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<InvoiceDto[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadInvoices();
  }, [page, statusFilter]);

  const loadInvoices = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), pageSize: '20' });
      if (statusFilter) params.set('status', statusFilter);
      const result = await api.get<PaginatedResponse<InvoiceDto>>(`/invoices?${params}`);
      setInvoices(result.data);
      setTotal(result.total);
    } catch {
      // handle
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 lg:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
          <p className="text-sm text-gray-500 mt-1">{total} total invoices</p>
        </div>
      </div>

      <div className="flex gap-3 items-center">
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-40"
        >
          <option value="">All Statuses</option>
          {Object.values(InvoiceStatus).map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Subtotal</TableHead>
                <TableHead className="text-right">Tax</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="hidden md:table-cell">Due Date</TableHead>
                <TableHead className="hidden md:table-cell">Sent</TableHead>
                <TableHead className="hidden lg:table-cell">Paid</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={8}>
                      <div className="h-5 bg-gray-100 rounded animate-pulse" />
                    </TableCell>
                  </TableRow>
                ))
              ) : invoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-gray-500 py-8">
                    No invoices found
                  </TableCell>
                </TableRow>
              ) : (
                invoices.map((inv) => {
                  const colors = INVOICE_STATUS_COLORS[inv.status];
                  return (
                    <TableRow key={inv.id}>
                      <TableCell>
                        <Link
                          href={`/invoices/${inv.id}`}
                          className="font-medium text-blue-600 hover:underline"
                        >
                          {inv.invoiceNumber}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${colors.bg} ${colors.text} border-0`}>
                          {inv.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">{formatCurrency(inv.subtotal)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(inv.taxAmount)}</TableCell>
                      <TableCell className="text-right font-semibold">{formatCurrency(inv.totalAmount)}</TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-gray-500">
                        {inv.dueDate ? formatDate(inv.dueDate) : '-'}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-gray-500">
                        {inv.sentAt ? formatDate(inv.sentAt) : '-'}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-sm text-gray-500">
                        {inv.paidAt ? formatDate(inv.paidAt) : '-'}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {total > 20 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Showing {(page - 1) * 20 + 1}-{Math.min(page * 20, total)} of {total}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
              Previous
            </Button>
            <Button variant="outline" size="sm" disabled={page * 20 >= total} onClick={() => setPage((p) => p + 1)}>
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
