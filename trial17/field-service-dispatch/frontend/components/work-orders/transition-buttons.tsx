'use client';

import { useActionState } from 'react';
import { Button } from '@/components/ui/button';
import { transitionWorkOrderAction } from '@/app/actions';
import { statusLabel } from '@/lib/utils';
import type { WorkOrderStatus } from '@/lib/types';

const VALID_TRANSITIONS: Record<WorkOrderStatus, WorkOrderStatus[]> = {
  CREATED: ['ASSIGNED', 'CANCELLED'],
  ASSIGNED: ['EN_ROUTE', 'CANCELLED'],
  EN_ROUTE: ['IN_PROGRESS', 'CANCELLED'],
  IN_PROGRESS: ['ON_HOLD', 'COMPLETED', 'CANCELLED'],
  ON_HOLD: ['IN_PROGRESS', 'CANCELLED'],
  COMPLETED: ['INVOICED', 'CANCELLED'],
  INVOICED: ['CLOSED', 'CANCELLED'],
  CLOSED: [],
  CANCELLED: [],
};

interface TransitionButtonsProps {
  workOrderId: string;
  currentStatus: WorkOrderStatus;
}

export function TransitionButtons({ workOrderId, currentStatus }: TransitionButtonsProps) {
  const transitions = VALID_TRANSITIONS[currentStatus];

  if (transitions.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Status transition actions">
      {transitions.map((status) => (
        <TransitionButton
          key={status}
          workOrderId={workOrderId}
          targetStatus={status}
        />
      ))}
    </div>
  );
}

function TransitionButton({
  workOrderId,
  targetStatus,
}: {
  workOrderId: string;
  targetStatus: WorkOrderStatus;
}) {
  const [state, action, isPending] = useActionState(
    async (_prevState: { error?: string }) => {
      try {
        await transitionWorkOrderAction(workOrderId, targetStatus);
        return {};
      } catch (err: any) {
        return { error: err.message || 'Transition failed' };
      }
    },
    {},
  );

  return (
    <form action={action}>
      <Button
        type="submit"
        variant={targetStatus === 'CANCELLED' ? 'destructive' : 'outline'}
        size="sm"
        disabled={isPending}
        aria-label={`Transition to ${statusLabel(targetStatus)}`}
      >
        {isPending ? 'Updating...' : statusLabel(targetStatus)}
      </Button>
      {state.error && (
        <p className="text-sm text-red-500 mt-1" role="alert">{state.error}</p>
      )}
    </form>
  );
}
