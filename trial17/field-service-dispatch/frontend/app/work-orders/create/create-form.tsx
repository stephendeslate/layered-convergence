'use client';

import { useActionState } from 'react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { createWorkOrderAction } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { Technician, Customer } from '@/lib/types';

interface CreateWorkOrderFormProps {
  technicians: Technician[];
  customers: Customer[];
}

export function CreateWorkOrderForm({ technicians, customers }: CreateWorkOrderFormProps) {
  const router = useRouter();
  const [state, action, isPending] = useActionState(createWorkOrderAction, {});

  useEffect(() => {
    if ((state as any)?.success) {
      router.push('/work-orders');
    }
  }, [state, router]);

  return (
    <form action={action} className="max-w-lg space-y-4">
      {(state as any)?.error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm" role="alert">
          {(state as any).error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="priority">Priority</Label>
        <Select id="priority" name="priority">
          <option value="LOW">Low</option>
          <option value="MEDIUM" selected>Medium</option>
          <option value="HIGH">High</option>
          <option value="URGENT">Urgent</option>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="technicianId">Technician</Label>
        <Select id="technicianId" name="technicianId">
          <option value="">Unassigned</option>
          {technicians.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="customerId">Customer</Label>
        <Select id="customerId" name="customerId">
          <option value="">None</option>
          {customers.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="scheduledAt">Scheduled Date</Label>
        <Input id="scheduledAt" name="scheduledAt" type="datetime-local" />
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending ? 'Creating...' : 'Create Work Order'}
      </Button>
    </form>
  );
}
