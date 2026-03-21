'use client';

import { useActionState, useRef, useEffect } from 'react';
import { updateTransactionStatusAction } from '@/app/actions';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Transaction, TransactionStatus } from '@/lib/types';

const BUYER_TRANSITIONS: Record<TransactionStatus, TransactionStatus[]> = {
  PENDING: ['FUNDED'],
  FUNDED: ['DISPUTED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: [],
  RELEASED: [],
  DISPUTED: [],
  RESOLVED: [],
  REFUNDED: [],
};

const SELLER_TRANSITIONS: Record<TransactionStatus, TransactionStatus[]> = {
  PENDING: [],
  FUNDED: ['SHIPPED'],
  SHIPPED: [],
  DELIVERED: [],
  RELEASED: [],
  DISPUTED: [],
  RESOLVED: [],
  REFUNDED: [],
};

export function UpdateStatusDialog({
  transaction,
  userRole,
}: {
  transaction: Transaction;
  userRole: string;
}) {
  const [state, formAction, isPending] = useActionState(updateTransactionStatusAction, null);
  const selectRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (state?.error) {
      selectRef.current?.focus();
    }
  }, [state]);

  const transitions =
    userRole === 'BUYER'
      ? BUYER_TRANSITIONS[transaction.status]
      : SELLER_TRANSITIONS[transaction.status];

  if (!transitions || transitions.length === 0) {
    return null;
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Update Status
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Transaction Status</DialogTitle>
          <DialogDescription>
            Change the status of this transaction.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="transactionId" value={transaction.id} />
          {state?.error && (
            <div role="alert" className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {state.error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="status">New Status</Label>
            <Select name="status" required>
              <SelectTrigger id="status" ref={selectRef}>
                <SelectValue placeholder="Select new status" />
              </SelectTrigger>
              <SelectContent>
                {transitions.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Updating...' : 'Update Status'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
