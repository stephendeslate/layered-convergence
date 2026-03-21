'use client';

import { useActionState } from 'react';
import { createWorkOrderAction } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Customer, Technician } from '@/lib/types';

interface WorkOrderFormProps {
  customers: Customer[];
  technicians: Technician[];
}

export default function WorkOrderForm({ customers, technicians }: WorkOrderFormProps) {
  const [state, formAction, isPending] = useActionState(createWorkOrderAction, null);

  return (
    <form action={formAction} className="space-y-4">
      {state?.error && (
        <div role="alert" className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {state.error}
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Input id="description" name="description" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="customerId">Customer</Label>
        <Select name="customerId" required>
          <SelectTrigger id="customerId">
            <SelectValue placeholder="Select a customer" />
          </SelectTrigger>
          <SelectContent>
            {customers.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="priority">Priority (1-5)</Label>
        <Input id="priority" name="priority" type="number" min={1} max={5} defaultValue={3} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="technicianId">Technician (optional)</Label>
        <Select name="technicianId">
          <SelectTrigger id="technicianId">
            <SelectValue placeholder="Select a technician" />
          </SelectTrigger>
          <SelectContent>
            {technicians.map((t) => (
              <SelectItem key={t.id} value={t.id}>
                {t.user?.email || t.userId}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="scheduledAt">Scheduled At (optional)</Label>
        <Input id="scheduledAt" name="scheduledAt" type="datetime-local" />
      </div>
      <Button type="submit" disabled={isPending}>
        {isPending ? 'Creating...' : 'Create Work Order'}
      </Button>
    </form>
  );
}
