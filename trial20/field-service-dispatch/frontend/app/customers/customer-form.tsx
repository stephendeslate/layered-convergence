'use client';

import { useActionState, useRef, useEffect } from 'react';
import { createCustomerAction } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function CustomerForm() {
  const [state, formAction, isPending] = useActionState(createCustomerAction, null);
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (state?.error) {
      nameRef.current?.focus();
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
        <Label htmlFor="customer-name">Name</Label>
        <Input ref={nameRef} id="customer-name" name="name" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="customer-email">Email</Label>
        <Input id="customer-email" name="email" type="email" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="customer-phone">Phone</Label>
        <Input id="customer-phone" name="phone" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="customer-address">Address</Label>
        <Input id="customer-address" name="address" required />
      </div>
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? 'Creating...' : 'Create Customer'}
      </Button>
    </form>
  );
}
