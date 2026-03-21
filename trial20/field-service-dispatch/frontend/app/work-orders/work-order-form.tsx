'use client';

import { useActionState, useRef, useEffect } from 'react';
import { createWorkOrderAction } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function WorkOrderForm() {
  const [state, formAction, isPending] = useActionState(createWorkOrderAction, null);
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (state?.error) {
      titleRef.current?.focus();
    }
  }, [state]);

  return (
    <form action={formAction} className="space-y-4">
      {state?.error && (
        <div role="alert" className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {state.error}
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="wo-title">Title</Label>
        <Input ref={titleRef} id="wo-title" name="title" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="wo-description">Description</Label>
        <Input id="wo-description" name="description" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="wo-customerId">Customer ID</Label>
        <Input id="wo-customerId" name="customerId" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="wo-priority">Priority</Label>
        <Select name="priority">
          <SelectTrigger id="wo-priority">
            <SelectValue placeholder="Select priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">1 - Highest</SelectItem>
            <SelectItem value="2">2 - High</SelectItem>
            <SelectItem value="3">3 - Medium</SelectItem>
            <SelectItem value="4">4 - Low</SelectItem>
            <SelectItem value="5">5 - Lowest</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="wo-technicianId">Technician ID (optional)</Label>
        <Input id="wo-technicianId" name="technicianId" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="wo-scheduledAt">Scheduled Date (optional)</Label>
        <Input id="wo-scheduledAt" name="scheduledAt" type="datetime-local" />
      </div>
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? 'Creating...' : 'Create Work Order'}
      </Button>
    </form>
  );
}
