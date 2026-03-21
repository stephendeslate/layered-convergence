'use client';

import { useActionState } from 'react';
import { resolveDisputeAction } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import type { ActionState } from '@/lib/types';

interface ResolveFormProps {
  disputeId: string;
}

export function ResolveForm({ disputeId }: ResolveFormProps) {
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    resolveDisputeAction,
    {},
  );

  if (state.success) {
    return (
      <p className="text-green-600 font-medium">
        Dispute resolved successfully.
      </p>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="disputeId" value={disputeId} />
      <div className="flex flex-col gap-2">
        <Label htmlFor="resolution">Resolution</Label>
        <Textarea
          id="resolution"
          name="resolution"
          required
          placeholder="Describe how this dispute was resolved"
          rows={4}
        />
      </div>

      {state.error && (
        <p role="alert" className="text-sm text-red-600">
          {state.error}
        </p>
      )}

      <Button type="submit" disabled={isPending} aria-busy={isPending}>
        {isPending ? 'Resolving...' : 'Resolve Dispute'}
      </Button>
    </form>
  );
}
