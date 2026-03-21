'use client';

import { transitionPipeline } from '@/app/actions';
import { Button } from '@/components/ui/button';

const VALID_TRANSITIONS: Record<string, string[]> = {
  DRAFT: ['ACTIVE'],
  ACTIVE: ['PAUSED', 'ARCHIVED'],
  PAUSED: ['ACTIVE', 'ARCHIVED'],
  ARCHIVED: ['DRAFT'],
};

interface TransitionButtonsProps {
  pipelineId: string;
  currentStatus: string;
}

export function TransitionButtons({ pipelineId, currentStatus }: TransitionButtonsProps) {
  const transitions = VALID_TRANSITIONS[currentStatus] ?? [];

  if (transitions.length === 0) {
    return <p className="text-sm text-muted-foreground">No transitions available.</p>;
  }

  return (
    <div className="flex gap-2">
      {transitions.map((status) => (
        <form key={status} action={transitionPipeline}>
          <input type="hidden" name="pipelineId" value={pipelineId} />
          <input type="hidden" name="status" value={status} />
          <Button
            type="submit"
            variant="outline"
            size="sm"
            aria-label={`Transition pipeline to ${status}`}
          >
            {status}
          </Button>
        </form>
      ))}
    </div>
  );
}
