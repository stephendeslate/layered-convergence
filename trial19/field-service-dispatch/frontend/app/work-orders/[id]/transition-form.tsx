'use client';

import { useActionState, useEffect, useRef } from 'react';
import { transitionWorkOrderAction } from '@/app/actions';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { ActionState, WorkOrderStatus } from '@/lib/types';

const VALID_TRANSITIONS: Record<WorkOrderStatus, WorkOrderStatus[]> = {
  PENDING: ['ASSIGNED'],
  ASSIGNED: ['IN_PROGRESS', 'ON_HOLD'],
  IN_PROGRESS: ['COMPLETED', 'ON_HOLD'],
  ON_HOLD: ['ASSIGNED', 'IN_PROGRESS'],
  COMPLETED: ['INVOICED'],
  INVOICED: [],
};

const initialState: ActionState = {};

interface TransitionFormProps {
  workOrderId: string;
  currentStatus: WorkOrderStatus;
}

export function TransitionForm({ workOrderId, currentStatus }: TransitionFormProps) {
  const [state, formAction, pending] = useActionState(transitionWorkOrderAction, initialState);
  const resultRef = useRef<HTMLDivElement>(null);

  const availableTransitions = VALID_TRANSITIONS[currentStatus] ?? [];

  useEffect(() => {
    if ((state?.error || state?.success) && resultRef.current) {
      resultRef.current.focus();
    }
  }, [state]);

  if (availableTransitions.length === 0) {
    return <p className="text-sm text-muted-foreground">No transitions available from this status.</p>;
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="workOrderId" value={workOrderId} />

      {state?.error && (
        <div ref={resultRef} tabIndex={-1} role="alert" className="text-sm text-destructive">
          {state.error}
        </div>
      )}
      {state?.success && (
        <div ref={resultRef} tabIndex={-1} className="text-sm text-green-600">
          Status updated successfully
        </div>
      )}

      <div className="flex gap-4 items-end">
        <div className="flex-1">
          <Select name="status" required>
            <SelectTrigger>
              <SelectValue placeholder="Select new status" />
            </SelectTrigger>
            <SelectContent>
              {availableTransitions.map((status) => (
                <SelectItem key={status} value={status}>
                  {status.replace(/_/g, ' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button type="submit" disabled={pending}>
          {pending ? 'Updating...' : 'Update Status'}
        </Button>
      </div>
    </form>
  );
}
