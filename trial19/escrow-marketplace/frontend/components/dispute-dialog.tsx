'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { createDisputeAction } from '@/lib/actions';
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
import type { ActionState } from '@/lib/types';

interface DisputeDialogProps {
  transactionId: string;
}

export function DisputeDialog({ transactionId }: DisputeDialogProps) {
  const initialState: ActionState = { error: null, success: false };
  const [state, formAction, isPending] = useActionState(createDisputeAction, initialState);
  const [open, setOpen] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (state.error && resultRef.current) {
      resultRef.current.focus();
    }
  }, [state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" size="sm">
          Open Dispute
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Dispute</DialogTitle>
          <DialogDescription>
            Describe the issue with this transaction.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction}>
          <input type="hidden" name="transactionId" value={transactionId} />
          <div className="space-y-4 py-4">
            <div
              ref={resultRef}
              tabIndex={-1}
              aria-live="polite"
              className="outline-none"
            >
              {state.error && (
                <p className="text-sm text-destructive">{state.error}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="reason">Reason</Label>
              <Input
                id="reason"
                name="reason"
                placeholder="Describe the issue..."
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" variant="destructive" disabled={isPending}>
              {isPending ? 'Submitting...' : 'Submit Dispute'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
