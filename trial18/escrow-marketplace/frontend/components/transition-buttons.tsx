'use client';

import { useActionState } from 'react';
import { updateStatusAction } from '@/lib/actions';
import type { TransactionStatus, ActionState } from '@/lib/types';

const VALID_TRANSITIONS: Record<TransactionStatus, TransactionStatus[]> = {
  PENDING: ['FUNDED', 'CANCELLED'],
  FUNDED: ['SHIPPED', 'DISPUTED', 'REFUNDED'],
  SHIPPED: ['DELIVERED', 'DISPUTED'],
  DELIVERED: ['RELEASED', 'DISPUTED'],
  RELEASED: ['COMPLETED'],
  COMPLETED: [],
  DISPUTED: ['REFUNDED', 'RELEASED'],
  REFUNDED: [],
  CANCELLED: [],
};

interface TransitionButtonsProps {
  transactionId: string;
  currentStatus: TransactionStatus;
}

export function TransitionButtons({
  transactionId,
  currentStatus,
}: TransitionButtonsProps) {
  const [state, action, isPending] = useActionState<ActionState, FormData>(
    updateStatusAction,
    { error: null, success: false },
  );

  const validTransitions = VALID_TRANSITIONS[currentStatus] ?? [];

  if (validTransitions.length === 0) {
    return <p className="text-sm text-gray-500">No available transitions</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      {state.error && (
        <p className="text-red-600 text-sm" role="alert">
          {state.error}
        </p>
      )}
      <div className="flex gap-2 flex-wrap">
        {validTransitions.map((status) => (
          <form key={status} action={action}>
            <input type="hidden" name="transactionId" value={transactionId} />
            <input type="hidden" name="status" value={status} />
            <button
              type="submit"
              disabled={isPending}
              className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label={`Transition to ${status}`}
            >
              {isPending ? 'Updating...' : status}
            </button>
          </form>
        ))}
      </div>
    </div>
  );
}
