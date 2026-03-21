'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table } from '@/components/ui/table';

interface WorkOrder {
  id: string;
  title: string;
  status: string;
  priority: string;
  customer: { name: string };
}

export default function DashboardPage() {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      window.location.href = '/login';
      return;
    }

    fetch(`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000'}/api/work-orders`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error('Failed to fetch work orders');
      })
      .then(setWorkOrders)
      .catch(() => setWorkOrders([]));
  }, []);

  const openCount = workOrders.filter((wo) => wo.status === 'OPEN').length;
  const inProgressCount = workOrders.filter((wo) => wo.status === 'IN_PROGRESS').length;
  const completedCount = workOrders.filter((wo) => wo.status === 'COMPLETED').length;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="p-4 bg-[var(--card)] border border-[var(--border)] rounded-lg">
          <p className="text-sm text-[var(--muted-foreground)]">Open Work Orders</p>
          <p className="text-3xl font-bold">{openCount}</p>
        </Card>
        <Card className="p-4 bg-[var(--card)] border border-[var(--border)] rounded-lg">
          <p className="text-sm text-[var(--muted-foreground)]">In Progress</p>
          <p className="text-3xl font-bold">{inProgressCount}</p>
        </Card>
        <Card className="p-4 bg-[var(--card)] border border-[var(--border)] rounded-lg">
          <p className="text-sm text-[var(--muted-foreground)]">Completed</p>
          <p className="text-3xl font-bold">{completedCount}</p>
        </Card>
      </div>

      <h2 className="text-xl font-semibold mb-4">Recent Work Orders</h2>
      <Table>
        <thead>
          <tr>
            <th className="text-left p-2">Title</th>
            <th className="text-left p-2">Customer</th>
            <th className="text-left p-2">Status</th>
            <th className="text-left p-2">Priority</th>
          </tr>
        </thead>
        <tbody>
          {workOrders.slice(0, 10).map((wo) => (
            <tr key={wo.id} className="border-t border-[var(--border)]">
              <td className="p-2">
                <a href={`/work-orders/${wo.id}`} className="text-[var(--primary)] hover:underline">
                  {wo.title}
                </a>
              </td>
              <td className="p-2">{wo.customer?.name}</td>
              <td className="p-2">
                <Badge variant={wo.status === 'COMPLETED' ? 'success' : 'default'}>
                  {wo.status}
                </Badge>
              </td>
              <td className="p-2">
                <Badge variant={wo.priority === 'URGENT' ? 'destructive' : 'secondary'}>
                  {wo.priority}
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}
