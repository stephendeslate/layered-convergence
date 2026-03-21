'use client';

import { useActionState, useRef, useEffect } from 'react';
import { createInvoiceAction } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function InvoiceForm() {
  const [state, formAction, isPending] = useActionState(createInvoiceAction, null);
  const workOrderRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (state?.error) {
      workOrderRef.current?.focus();
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
        <Label htmlFor="inv-workOrderId">Work Order ID</Label>
        <Input ref={workOrderRef} id="inv-workOrderId" name="workOrderId" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="inv-amount">Amount</Label>
        <Input id="inv-amount" name="amount" type="number" step="0.01" min="0" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="inv-tax">Tax</Label>
        <Input id="inv-tax" name="tax" type="number" step="0.01" min="0" required />
      </div>
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? 'Creating...' : 'Create Invoice'}
      </Button>
    </form>
  );
}
