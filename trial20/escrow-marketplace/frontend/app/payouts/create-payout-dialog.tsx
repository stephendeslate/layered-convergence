'use client';

import { useActionState, useRef, useEffect } from 'react';
import { createPayoutAction } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export function CreatePayoutDialog() {
  const [state, formAction, isPending] = useActionState(createPayoutAction, null);
  const txIdRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (state?.error) {
      txIdRef.current?.focus();
    }
  }, [state]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Request Payout</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request Payout</DialogTitle>
          <DialogDescription>
            Request a payout for a delivered transaction.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          {state?.error && (
            <div role="alert" className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {state.error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="transactionId">Transaction ID</Label>
            <Input ref={txIdRef} id="transactionId" name="transactionId" required />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Requesting...' : 'Request Payout'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
