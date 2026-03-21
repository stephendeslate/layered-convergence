'use client';

import { useActionState, useEffect, useRef } from 'react';
import { updateStatusAction } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import type { ActionState, TransactionStatus } from '@/lib/types';

const STATUS_LABELS: Record<TransactionStatus, string> = {
  PENDING: 'Pending',
  FUNDED: 'Fund',
  SHIPPED: 'Ship',
  DELIVERED: 'Deliver',
  RELEASED: 'Release',
  DISPUTED: 'Dispute',
  RESOLVED: 'Resolve',
  REFUNDED: 'Refund',
};

const VALID_TRANSITIONS: Record<TransactionStatus, TransactionStatus[]> = {
  PENDING: ['FUNDED'],
  FUNDED: ['SHIPPED', 'DISPUTED'],
  SHIPPED: ['DELIVERED', 'DISPUTED'],
  DELIVERED: ['RELEASED', 'DISPUTED'],
  RELEASED: [],
  DISPUTED: ['RESOLVED'],
  RESOLVED: ['RELEASED', 'REFUNDED'],
  REFUNDED: [],
};

interface TransitionButtonsProps {
  transactionId: string;
  currentStatus: TransactionStatus;
}

export function TransitionButtons({ transactionId, currentStatus }: TransitionButtonsProps) {
  const initialState: ActionState = { error: null, success: false };
  const [state, formAction, isPending] = useActionState(updateStatusAction, initialState);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if ((state.success || state.error) && resultRef.current) {
      resultRef.current.focus();
    }
  }, [state]);

  const transitions = VALID_TRANSITIONS[currentStatus] ?? [];

  if (transitions.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <div
        ref={resultRef}
        tabIndex={-1}
        aria-live="polite"
        className="outline-none"
      >
        {state.error && (
          <p className="text-sm text-destructive">{state.error}</p>
        )}
        {state.success && (
          <p className="text-sm text-green-600 dark:text-green-400">Status updated successfully</p>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {transitions.map((status) => (
          <form key={status} action={formAction}>
            <input type="hidden" name="transactionId" value={transactionId} />
            <input type="hidden" name="status" value={status} />
            <Button
              type="submit"
              variant={status === 'DISPUTED' ? 'destructive' : 'default'}
              size="sm"
              disabled={isPending}
            >
              {isPending ? 'Updating...' : STATUS_LABELS[status]}
            </Button>
          </form>
        ))}
      </div>
    </div>
  );
}
