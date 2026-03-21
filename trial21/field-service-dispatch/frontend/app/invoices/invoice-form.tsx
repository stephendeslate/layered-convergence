'use client';

import { useActionState } from 'react';
import { createInvoiceAction } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { WorkOrder } from '@/lib/types';

interface InvoiceFormProps {
  workOrders: WorkOrder[];
}

export default function InvoiceForm({ workOrders }: InvoiceFormProps) {
  const [state, formAction, isPending] = useActionState(createInvoiceAction, null);

  return (
    <form action={formAction} className="space-y-4">
      {state?.error && (
        <div role="alert" className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {state.error}
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="workOrderId">Work Order</Label>
        <Select name="workOrderId" required>
          <SelectTrigger id="workOrderId">
            <SelectValue placeholder="Select a work order" />
          </SelectTrigger>
          <SelectContent>
            {workOrders.map((wo) => (
              <SelectItem key={wo.id} value={wo.id}>
                {wo.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="amount">Amount</Label>
        <Input id="amount" name="amount" type="number" step="0.01" min="0" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="tax">Tax</Label>
        <Input id="tax" name="tax" type="number" step="0.01" min="0" required />
      </div>
      <Button type="submit" disabled={isPending}>
        {isPending ? 'Creating...' : 'Create Invoice'}
      </Button>
    </form>
  );
}
