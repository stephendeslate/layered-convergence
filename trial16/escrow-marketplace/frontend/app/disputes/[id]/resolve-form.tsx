'use client';

import { useTransition, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { resolveDispute } from '@/app/actions';

interface ResolveDisputeFormProps {
  disputeId: string;
}

export function ResolveDisputeForm({ disputeId }: ResolveDisputeFormProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    formData.set('disputeId', disputeId);
    startTransition(async () => {
      try {
        await resolveDispute(formData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to resolve dispute');
      }
    });
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-600" role="alert">
          {error}
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="resolution">Resolution</Label>
        <Select id="resolution" name="resolution" required defaultValue="">
          <option value="" disabled>
            Select resolution
          </option>
          <option value="RELEASE">Release funds to seller</option>
          <option value="REFUND">Refund to buyer</option>
        </Select>
      </div>
      <Button type="submit" disabled={isPending}>
        {isPending ? 'Resolving...' : 'Resolve Dispute'}
      </Button>
    </form>
  );
}
