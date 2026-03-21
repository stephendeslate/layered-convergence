'use client';

import { useActionState, useRef, useEffect } from 'react';
import { createWebhookAction } from '@/app/actions';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function CreateWebhookDialog() {
  const [state, formAction, isPending] = useActionState(createWebhookAction, null);
  const urlRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (state?.error) {
      urlRef.current?.focus();
    }
  }, [state]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Add Webhook</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Webhook</DialogTitle>
          <DialogDescription>
            Register a webhook URL for event notifications.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          {state?.error && (
            <div role="alert" className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {state.error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="url">Webhook URL</Label>
            <Input ref={urlRef} id="url" name="url" type="url" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="event">Event</Label>
            <Select name="event" required>
              <SelectTrigger id="event">
                <SelectValue placeholder="Select an event" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="transaction.created">Transaction Created</SelectItem>
                <SelectItem value="transaction.funded">Transaction Funded</SelectItem>
                <SelectItem value="transaction.shipped">Transaction Shipped</SelectItem>
                <SelectItem value="transaction.delivered">Transaction Delivered</SelectItem>
                <SelectItem value="transaction.released">Transaction Released</SelectItem>
                <SelectItem value="dispute.created">Dispute Created</SelectItem>
                <SelectItem value="dispute.resolved">Dispute Resolved</SelectItem>
                <SelectItem value="payout.created">Payout Created</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Adding...' : 'Add Webhook'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
