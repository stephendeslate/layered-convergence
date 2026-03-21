'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table } from '@/components/ui/table';
import { Select } from '@/components/ui/select';

interface WorkOrder {
  id: string;
  title: string;
  status: string;
  priority: string;
  scheduledDate: string | null;
  customer: { name: string };
  technician: { name: string } | null;
}

const STATUS_OPTIONS = ['ALL', 'OPEN', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'INVOICED', 'CLOSED', 'CANCELLED'];

export default function WorkOrdersPage() {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      window.location.href = '/login';
      return;
    }

    const url = statusFilter === 'ALL'
      ? `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000'}/api/work-orders`
      : `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000'}/api/work-orders?status=${statusFilter}`;

    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error('Failed to fetch');
      })
      .then(setWorkOrders)
      .catch(() => setWorkOrders([]));
  }, [statusFilter]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Work Orders</h1>
        <Link href="/work-orders/new">
          <Button>New Work Order</Button>
        </Link>
      </div>

      <div className="mb-4">
        <Select
          value={statusFilter}
          onChange={(value) => setStatusFilter(value)}
          options={STATUS_OPTIONS.map((s) => ({ label: s, value: s }))}
          aria-label="Filter by status"
        />
      </div>

      <Table>
        <thead>
          <tr>
            <th className="text-left p-2">Title</th>
            <th className="text-left p-2">Customer</th>
            <th className="text-left p-2">Technician</th>
            <th className="text-left p-2">Status</th>
            <th className="text-left p-2">Priority</th>
            <th className="text-left p-2">Scheduled</th>
          </tr>
        </thead>
        <tbody>
          {workOrders.map((wo) => (
            <tr key={wo.id} className="border-t border-[var(--border)]">
              <td className="p-2">
                <Link href={`/work-orders/${wo.id}`} className="text-[var(--primary)] hover:underline">
                  {wo.title}
                </Link>
              </td>
              <td className="p-2">{wo.customer?.name}</td>
              <td className="p-2">{wo.technician?.name ?? '---'}</td>
              <td className="p-2"><Badge>{wo.status}</Badge></td>
              <td className="p-2"><Badge variant="secondary">{wo.priority}</Badge></td>
              <td className="p-2">{wo.scheduledDate ? new Date(wo.scheduledDate).toLocaleDateString() : '---'}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}
