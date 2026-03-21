'use client';

import { useActionState } from 'react';
import { transitionWorkOrderAction } from '@/app/actions';
import type { ActionState, WorkOrderStatus } from '@/lib/types';

const VALID_TRANSITIONS: Record<WorkOrderStatus, WorkOrderStatus[]> = {
  PENDING: ['ASSIGNED', 'CANCELLED'],
  ASSIGNED: ['IN_PROGRESS', 'CANCELLED'],
  IN_PROGRESS: ['ON_HOLD', 'COMPLETED', 'CANCELLED'],
  ON_HOLD: ['IN_PROGRESS', 'CANCELLED'],
  COMPLETED: ['INVOICED'],
  INVOICED: [],
  CANCELLED: [],
};

interface TransitionButtonsProps {
  workOrderId: string;
  currentStatus: WorkOrderStatus;
}

const initialState: ActionState = {};

export function TransitionButtons({ workOrderId, currentStatus }: TransitionButtonsProps) {
  const [state, formAction, isPending] = useActionState(transitionWorkOrderAction, initialState);
  const transitions = VALID_TRANSITIONS[currentStatus];

  if (transitions.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow p-4 space-y-3">
      <h2 className="text-sm font-medium text-gray-500">Transition To</h2>
      {state.error && (
        <div role="alert" className="bg-red-50 text-red-700 p-2 rounded text-sm">
          {state.error}
        </div>
      )}
      {state.success && (
        <div className="bg-green-50 text-green-700 p-2 rounded text-sm">
          Status updated successfully
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        {transitions.map((status) => (
          <form key={status} action={formAction}>
            <input type="hidden" name="workOrderId" value={workOrderId} />
            <input type="hidden" name="status" value={status} />
            <button
              type="submit"
              disabled={isPending}
              className="px-3 py-1.5 text-sm rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
              aria-label={`Transition to ${status}`}
            >
              {status.replace('_', ' ')}
            </button>
          </form>
        ))}
      </div>
    </div>
  );
}
