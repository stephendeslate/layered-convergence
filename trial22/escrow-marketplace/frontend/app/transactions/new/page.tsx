'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { apiFetch } from '@/lib/api';

export default function NewTransactionPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const sellerId = formData.get('sellerId') as string;
    const amount = formData.get('amount') as string;
    const description = formData.get('description') as string;

    const response = await apiFetch('/transactions', {
      method: 'POST',
      body: JSON.stringify({ sellerId, amount, description }),
    });

    // Server Action pattern: check response.ok before redirect
    if (response.ok) {
      const data = await response.json();
      router.push(`/transactions/${data.id}`);
    } else {
      const data = await response.json();
      setError(data.message ?? 'Failed to create transaction');
    }

    setLoading(false);
  }

  return (
    <div className="flex justify-center py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>New Transaction</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div role="alert" className="text-sm text-destructive">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="sellerId">Seller ID</Label>
              <Input
                id="sellerId"
                name="sellerId"
                type="text"
                required
                placeholder="Enter seller's UUID"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Amount ($)</Label>
              <Input
                id="amount"
                name="amount"
                type="text"
                required
                placeholder="0.00"
                pattern="^\d+(\.\d{1,2})?$"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                name="description"
                type="text"
                required
                placeholder="What are you purchasing?"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating...' : 'Create Transaction'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
