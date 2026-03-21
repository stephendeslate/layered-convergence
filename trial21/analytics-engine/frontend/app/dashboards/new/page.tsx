'use client';

import { useActionState } from 'react';
import { createDashboardAction } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function NewDashboardPage() {
  const [state, formAction, isPending] = useActionState(createDashboardAction, null);

  return (
    <div className="mx-auto max-w-md">
      <Card>
        <CardHeader>
          <CardTitle>Create Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            {state?.error && (
              <p role="alert" className="text-sm text-[var(--destructive)]">{state.error}</p>
            )}
            <div className="space-y-2">
              <Label htmlFor="name">Dashboard Name</Label>
              <Input id="name" name="name" required />
            </div>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Creating...' : 'Create Dashboard'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
