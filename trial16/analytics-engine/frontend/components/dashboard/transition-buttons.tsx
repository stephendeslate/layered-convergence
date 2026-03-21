'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { transitionPipeline } from '@/app/actions';
import type { PipelineStatus } from '@/lib/types';

const VALID_TRANSITIONS: Record<PipelineStatus, PipelineStatus[]> = {
  DRAFT: ['ACTIVE'],
  ACTIVE: ['PAUSED', 'FAILED', 'COMPLETED'],
  PAUSED: ['ACTIVE', 'FAILED'],
  FAILED: ['DRAFT'],
  COMPLETED: ['DRAFT'],
};

const BUTTON_LABELS: Record<PipelineStatus, string> = {
  DRAFT: 'Reset to Draft',
  ACTIVE: 'Activate',
  PAUSED: 'Pause',
  FAILED: 'Mark Failed',
  COMPLETED: 'Complete',
};

const BUTTON_VARIANTS: Record<PipelineStatus, 'default' | 'destructive' | 'outline' | 'secondary'> = {
  DRAFT: 'outline',
  ACTIVE: 'default',
  PAUSED: 'secondary',
  FAILED: 'destructive',
  COMPLETED: 'default',
};

interface TransitionButtonsProps {
  pipelineId: string;
  currentStatus: PipelineStatus;
}

export function TransitionButtons({ pipelineId, currentStatus }: TransitionButtonsProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const allowedTargets = VALID_TRANSITIONS[currentStatus] ?? [];

  function handleTransition(targetStatus: PipelineStatus) {
    setError(null);
    startTransition(async () => {
      try {
        await transitionPipeline(pipelineId, targetStatus);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Transition failed');
      }
    });
  }

  if (allowedTargets.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Pipeline transition actions">
        {allowedTargets.map((target) => (
          <Button
            key={target}
            variant={BUTTON_VARIANTS[target]}
            size="sm"
            disabled={isPending}
            onClick={() => handleTransition(target)}
            aria-label={`${BUTTON_LABELS[target]} pipeline`}
          >
            {isPending ? 'Transitioning...' : BUTTON_LABELS[target]}
          </Button>
        ))}
      </div>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
