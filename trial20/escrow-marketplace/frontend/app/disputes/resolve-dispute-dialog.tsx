'use client';

import { useActionState, useRef, useEffect } from 'react';
import { resolveDisputeAction } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export function ResolveDisputeDialog({ disputeId }: { disputeId: string }) {
  const [state, formAction, isPending] = useActionState(resolveDisputeAction, null);
  const resolutionRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (state?.error) {
      resolutionRef.current?.focus();
    }
  }, [state]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Resolve
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Resolve Dispute</DialogTitle>
          <DialogDescription>
            Provide a resolution for this dispute.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="disputeId" value={disputeId} />
          {state?.error && (
            <div role="alert" className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {state.error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="resolution">Resolution</Label>
            <Input ref={resolutionRef} id="resolution" name="resolution" required />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Resolving...' : 'Resolve Dispute'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
