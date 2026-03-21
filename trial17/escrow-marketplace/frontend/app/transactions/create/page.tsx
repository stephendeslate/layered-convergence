'use client';

import { useActionState } from 'react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { createTransactionAction } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import type { ActionState } from '@/lib/types';

export default function CreateTransactionPage() {
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    createTransactionAction,
    {},
  );
  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      router.push('/transactions');
    }
  }, [state.success, router]);

  return (
    <div className="max-w-lg mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Create Transaction</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                required
                placeholder="Item or service description"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="amount">Amount (USD)</Label>
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

            <div className="flex flex-col gap-2">
              <Label htmlFor="sellerId">Seller ID</Label>
              <Input
                id="sellerId"
                name="sellerId"
                required
                placeholder="Enter seller's user ID"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Additional details about the transaction"
              />
            </div>

            {state.error && (
              <p role="alert" className="text-sm text-red-600">
                {state.error}
              </p>
            )}

            <Button type="submit" disabled={isPending} aria-busy={isPending}>
              {isPending ? 'Creating...' : 'Create Transaction'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
