'use client';

import { useActionState, useEffect, useRef } from 'react';
import { resolveDisputeAction } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { ActionState } from '@/lib/types';

interface ResolveDisputeFormProps {
  disputeId: string;
}

export function ResolveDisputeForm({ disputeId }: ResolveDisputeFormProps) {
  const initialState: ActionState = { error: null, success: false };
  const [state, formAction, isPending] = useActionState(resolveDisputeAction, initialState);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if ((state.success || state.error) && resultRef.current) {
      resultRef.current.focus();
    }
  }, [state]);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="disputeId" value={disputeId} />
      <div
        ref={resultRef}
        tabIndex={-1}
        aria-live="polite"
        className="outline-none"
      >
        {state.error && (
          <p className="text-sm text-destructive" role="alert">{state.error}</p>
        )}
        {state.success && (
          <p className="text-sm text-green-600 dark:text-green-400">Dispute resolved successfully</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="resolution">Resolution</Label>
        <Input
          id="resolution"
          name="resolution"
          required
          placeholder="Describe the resolution..."
        />
      </div>
      <Button type="submit" disabled={isPending}>
        {isPending ? 'Resolving...' : 'Resolve Dispute'}
      </Button>
    </form>
  );
}
