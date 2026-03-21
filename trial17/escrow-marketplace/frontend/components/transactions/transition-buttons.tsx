'use client';

import { useActionState } from 'react';
import { transitionTransactionAction } from '@/app/actions';
import { Button } from '@/components/ui/button';
import type { TransactionStatus, ActionState } from '@/lib/types';

const VALID_TRANSITIONS: Record<TransactionStatus, TransactionStatus[]> = {
  PENDING: ['FUNDED', 'CANCELLED'],
  FUNDED: ['SHIPPED', 'DISPUTED', 'CANCELLED'],
  SHIPPED: ['DELIVERED', 'DISPUTED'],
  DELIVERED: ['RELEASED', 'DISPUTED'],
  RELEASED: [],
  CANCELLED: ['REFUNDED'],
  DISPUTED: ['RESOLVED'],
  RESOLVED: ['RELEASED', 'REFUNDED'],
  REFUNDED: [],
};

const TRANSITION_LABELS: Record<TransactionStatus, string> = {
  PENDING: 'Pending',
  FUNDED: 'Fund',
  SHIPPED: 'Mark Shipped',
  DELIVERED: 'Mark Delivered',
  RELEASED: 'Release Funds',
  CANCELLED: 'Cancel',
  DISPUTED: 'Dispute',
  RESOLVED: 'Resolve',
  REFUNDED: 'Refund',
};

const TRANSITION_VARIANTS: Record<string, 'default' | 'destructive' | 'outline'> = {
  CANCELLED: 'destructive',
  DISPUTED: 'destructive',
  REFUNDED: 'outline',
};

interface TransitionButtonsProps {
  transactionId: string;
  currentStatus: TransactionStatus;
}

export function TransitionButtons({
  transactionId,
  currentStatus,
}: TransitionButtonsProps) {
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    transitionTransactionAction,
    {},
  );

  const availableTransitions = VALID_TRANSITIONS[currentStatus] || [];

  if (availableTransitions.length === 0) {
    return (
      <p className="text-sm text-gray-500">
        No actions available for {currentStatus} status.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Transaction actions">
        {availableTransitions.map((target) => (
          <form key={target} action={formAction}>
            <input type="hidden" name="transactionId" value={transactionId} />
            <input type="hidden" name="action" value={target} />
            <Button
              type="submit"
              variant={TRANSITION_VARIANTS[target] || 'default'}
              size="sm"
              disabled={isPending}
              aria-busy={isPending}
            >
              {isPending ? 'Processing...' : TRANSITION_LABELS[target] || target}
            </Button>
          </form>
        ))}
      </div>
      {state.error && (
        <p role="alert" className="text-sm text-red-600">
          {state.error}
        </p>
      )}
    </div>
  );
}
