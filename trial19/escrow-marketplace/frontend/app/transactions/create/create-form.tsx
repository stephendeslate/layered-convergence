'use client';

import { useActionState, useEffect, useRef } from 'react';
import { createTransactionAction } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import type { ActionState } from '@/lib/types';

export function CreateTransactionForm() {
  const initialState: ActionState = { error: null, success: false };
  const [state, formAction, isPending] = useActionState(createTransactionAction, initialState);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (state.error && resultRef.current) {
      resultRef.current.focus();
    }
  }, [state]);

  return (
    <Card>
      <CardContent className="pt-6">
        <form action={formAction} className="space-y-4">
          <div
            ref={resultRef}
            tabIndex={-1}
            aria-live="polite"
            className="outline-none"
          >
            {state.error && (
              <p className="text-sm text-destructive" role="alert">{state.error}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" required placeholder="Transaction title" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Input id="description" name="description" placeholder="Description" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">Amount ($)</Label>
            <Input
              id="amount"
              name="amount"
              type="number"
              step="0.01"
              min="0.01"
              required
              placeholder="0.00"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sellerId">Seller ID</Label>
            <Input id="sellerId" name="sellerId" required placeholder="Seller UUID" />
          </div>
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? 'Creating...' : 'Create Transaction'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
