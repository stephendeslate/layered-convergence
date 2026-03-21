'use client';

import { useTransition, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { createTransaction } from '@/app/actions';

export default function CreateTransactionPage() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      try {
        await createTransaction(formData);
        router.push('/transactions');
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to create transaction',
        );
      }
    });
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Create Transaction</CardTitle>
          <CardDescription>
            Set up a new escrow transaction with a seller
          </CardDescription>
        </CardHeader>
        <form action={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-600" role="alert">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                type="text"
                placeholder="Transaction title"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Optional description"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (USD)</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                placeholder="0.00"
                min="0.01"
                step="0.01"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sellerId">Seller ID</Label>
              <Input
                id="sellerId"
                name="sellerId"
                type="text"
                placeholder="Enter seller user ID"
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex gap-3">
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Creating...' : 'Create Transaction'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
