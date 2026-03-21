'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Select } from '@/components/ui/select';

interface WorkOrder {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  scheduledDate: string | null;
  completedDate: string | null;
  customer: { name: string };
  technician: { id: string; name: string } | null;
  invoice: { id: string; invoiceNumber: string; totalAmount: string } | null;
}

interface Technician {
  id: string;
  name: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

export default function WorkOrderDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [workOrder, setWorkOrder] = useState<WorkOrder | null>(null);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [selectedTechnicianId, setSelectedTechnicianId] = useState('');

  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

  useEffect(() => {
    if (!token) {
      window.location.href = '/login';
      return;
    }

    const headers = { Authorization: `Bearer ${token}` };

    fetch(`${API_URL}/api/work-orders/${id}`, { headers })
      .then((res) => { if (res.ok) return res.json(); throw new Error('Not found'); })
      .then(setWorkOrder);

    fetch(`${API_URL}/api/technicians`, { headers })
      .then((res) => { if (res.ok) return res.json(); throw new Error('Failed'); })
      .then(setTechnicians)
      .catch(() => setTechnicians([]));
  }, [id, token]);

  async function updateStatus(newStatus: string) {
    const response = await fetch(`${API_URL}/api/work-orders/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status: newStatus }),
    });
    if (response.ok) {
      const updated = await response.json();
      setWorkOrder(updated);
    }
  }

  async function assignTechnician() {
    if (!selectedTechnicianId) return;
    const response = await fetch(`${API_URL}/api/work-orders/${id}/assign`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ technicianId: selectedTechnicianId }),
    });
    if (response.ok) {
      const updated = await response.json();
      setWorkOrder(updated);
    }
  }

  if (!workOrder) {
    return <div role="status" aria-busy="true"><span className="sr-only">Loading...</span></div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{workOrder.title}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 bg-[var(--card)] border border-[var(--border)] rounded-lg">
          <h2 className="text-lg font-semibold mb-4">Details</h2>
          <dl className="space-y-2">
            <div><dt className="text-sm text-[var(--muted-foreground)]">Status</dt><dd><Badge>{workOrder.status}</Badge></dd></div>
            <div><dt className="text-sm text-[var(--muted-foreground)]">Priority</dt><dd><Badge variant="secondary">{workOrder.priority}</Badge></dd></div>
            <div><dt className="text-sm text-[var(--muted-foreground)]">Customer</dt><dd>{workOrder.customer?.name}</dd></div>
            <div><dt className="text-sm text-[var(--muted-foreground)]">Technician</dt><dd>{workOrder.technician?.name ?? 'Unassigned'}</dd></div>
            {workOrder.description && <div><dt className="text-sm text-[var(--muted-foreground)]">Description</dt><dd>{workOrder.description}</dd></div>}
            {workOrder.scheduledDate && <div><dt className="text-sm text-[var(--muted-foreground)]">Scheduled</dt><dd>{new Date(workOrder.scheduledDate).toLocaleDateString()}</dd></div>}
            {workOrder.completedDate && <div><dt className="text-sm text-[var(--muted-foreground)]">Completed</dt><dd>{new Date(workOrder.completedDate).toLocaleDateString()}</dd></div>}
          </dl>
        </Card>

        <Card className="p-6 bg-[var(--card)] border border-[var(--border)] rounded-lg">
          <h2 className="text-lg font-semibold mb-4">Actions</h2>
          <div className="space-y-3">
            {workOrder.status === 'OPEN' && (
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <Select
                    value={selectedTechnicianId}
                    onChange={setSelectedTechnicianId}
                    options={technicians.map((t) => ({ label: t.name, value: t.id }))}
                    aria-label="Select technician"
                  />
                </div>
                <Button onClick={assignTechnician}>Assign</Button>
              </div>
            )}
            {workOrder.status === 'ASSIGNED' && (
              <Button onClick={() => updateStatus('IN_PROGRESS')}>Start Work</Button>
            )}
            {workOrder.status === 'IN_PROGRESS' && (
              <Button onClick={() => updateStatus('COMPLETED')}>Complete</Button>
            )}
            {workOrder.status === 'INVOICED' && (
              <Button onClick={() => updateStatus('CLOSED')}>Close</Button>
            )}
            {workOrder.status !== 'CANCELLED' && workOrder.status !== 'CLOSED' && (
              <Button variant="destructive" onClick={() => updateStatus('CANCELLED')}>Cancel</Button>
            )}
          </div>

          {workOrder.invoice && (
            <div className="mt-6 pt-4 border-t border-[var(--border)]">
              <h3 className="font-semibold mb-2">Invoice</h3>
              <p>Number: {workOrder.invoice.invoiceNumber}</p>
              <p>Total: ${workOrder.invoice.totalAmount}</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
