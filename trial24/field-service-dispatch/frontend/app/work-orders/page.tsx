// [TRACED:UI-013] Work Orders list page with status badges and table

'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface WorkOrder {
  id: string;
  title: string;
  status: string;
  customer?: { name: string };
  technician?: { name: string };
  createdAt: string;
}

export default function WorkOrdersPage() {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWorkOrders() {
      try {
        const res = await apiFetch('/work-orders');
        if (res.ok) {
          const data = await res.json();
          setWorkOrders(data);
        }
      } finally {
        setLoading(false);
      }
    }
    fetchWorkOrders();
  }, []);

  if (loading) {
    return <p className="text-[var(--muted-foreground)]">Loading work orders...</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-[var(--foreground)]">Work Orders</h1>
        <Link href="/work-orders/new">
          <Button>Create Work Order</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Work Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {workOrders.length === 0 ? (
            <p className="text-sm text-[var(--muted-foreground)]">No work orders found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Technician</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workOrders.map((wo) => (
                  <TableRow key={wo.id}>
                    <TableCell className="font-medium">{wo.title}</TableCell>
                    <TableCell>
                      <Badge variant={wo.status === 'COMPLETED' ? 'default' : 'secondary'}>
                        {wo.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{wo.customer?.name ?? '—'}</TableCell>
                    <TableCell>{wo.technician?.name ?? 'Unassigned'}</TableCell>
                    <TableCell>{new Date(wo.createdAt).toLocaleDateString()}</TableCell>
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
