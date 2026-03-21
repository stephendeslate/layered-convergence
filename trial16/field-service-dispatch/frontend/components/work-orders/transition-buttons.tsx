'use client';

import { useActionState } from 'react';
import { Button } from '@/components/ui/button';
import { transitionWorkOrder } from '@/app/actions';
import type { WorkOrderStatus } from '@/lib/types';
import { statusLabel } from '@/lib/utils';

const VALID_TRANSITIONS: Record<WorkOrderStatus, WorkOrderStatus[]> = {
  CREATED: ['ASSIGNED'],
  ASSIGNED: ['EN_ROUTE'],
  EN_ROUTE: ['IN_PROGRESS'],
  IN_PROGRESS: ['ON_HOLD', 'COMPLETED'],
  ON_HOLD: ['IN_PROGRESS'],
  COMPLETED: ['INVOICED'],
  INVOICED: ['PAID'],
  PAID: ['CLOSED'],
  CLOSED: [],
};

interface TransitionButtonsProps {
  workOrderId: string;
  currentStatus: WorkOrderStatus;
}

export function TransitionButtons({ workOrderId, currentStatus }: TransitionButtonsProps) {
  const transitions = VALID_TRANSITIONS[currentStatus] ?? [];
  const [state, formAction, isPending] = useActionState(transitionWorkOrder, null);

  if (transitions.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No available transitions from {statusLabel(currentStatus)}.
      </p>
    );
  }

  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Work order transitions">
      {transitions.map((targetStatus) => (
        <form key={targetStatus} action={formAction}>
          <input type="hidden" name="workOrderId" value={workOrderId} />
          <input type="hidden" name="status" value={targetStatus} />
          <Button
            type="submit"
            variant="outline"
            size="sm"
            disabled={isPending}
          >
            {statusLabel(targetStatus)}
          </Button>
        </form>
      ))}
      {state?.error && (
        <p className="text-sm text-destructive w-full" role="alert">
          {state.error}
        </p>
      )}
    </div>
  );
}
