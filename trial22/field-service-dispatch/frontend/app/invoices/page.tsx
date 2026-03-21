'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Table } from '@/components/ui/table';

interface Invoice {
  id: string;
  invoiceNumber: string;
  amount: string;
  taxAmount: string;
  totalAmount: string;
  status: string;
  workOrder: { title: string };
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) { window.location.href = '/login'; return; }

    fetch(`${API_URL}/api/invoices`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => { if (res.ok) return res.json(); throw new Error('Failed'); })
      .then(setInvoices)
      .catch(() => setInvoices([]));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Invoices</h1>
      <Table>
        <thead>
          <tr>
            <th className="text-left p-2">Invoice #</th>
            <th className="text-left p-2">Work Order</th>
            <th className="text-right p-2">Amount</th>
            <th className="text-right p-2">Tax</th>
            <th className="text-right p-2">Total</th>
            <th className="text-left p-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((inv) => (
            <tr key={inv.id} className="border-t border-[var(--border)]">
              <td className="p-2">{inv.invoiceNumber}</td>
              <td className="p-2">{inv.workOrder?.title}</td>
              <td className="p-2 text-right">${inv.amount}</td>
              <td className="p-2 text-right">${inv.taxAmount}</td>
              <td className="p-2 text-right font-semibold">${inv.totalAmount}</td>
              <td className="p-2"><Badge>{inv.status}</Badge></td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}
