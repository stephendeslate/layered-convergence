'use client';

import { Button } from '@/components/ui/button';
import { transitionPipeline } from '@/app/actions';

const TRANSITIONS: Record<string, string[]> = {
  DRAFT: ['ACTIVE'],
  ACTIVE: ['PAUSED', 'FAILED', 'COMPLETED'],
  PAUSED: ['ACTIVE'],
  FAILED: ['DRAFT'],
  COMPLETED: ['DRAFT'],
};

interface TransitionButtonsProps {
  pipelineId: string;
  currentStatus: string;
}

export function TransitionButtons({ pipelineId, currentStatus }: TransitionButtonsProps) {
  const allowed = TRANSITIONS[currentStatus] ?? [];

  if (allowed.length === 0) return null;

  return (
    <div className="flex gap-2 mt-2">
      {allowed.map((target) => (
        <form key={target} action={transitionPipeline}>
          <input type="hidden" name="pipelineId" value={pipelineId} />
          <input type="hidden" name="status" value={target} />
          <Button type="submit" variant="outline" size="sm">
            {target}
          </Button>
        </form>
      ))}
    </div>
  );
}
