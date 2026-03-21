'use client';

import { useActionState, useRef, useEffect } from 'react';
import { createDashboardAction } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function NewDashboardPage() {
  const [state, formAction, isPending] = useActionState(createDashboardAction, null);
  const errorRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (state?.error && errorRef.current) {
      errorRef.current.focus();
    }
  }, [state?.error]);

  return (
    <div className="flex justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>New Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            {state?.error && (
              <p ref={errorRef} role="alert" tabIndex={-1} className="text-sm text-[var(--destructive)]">
                {state.error}
              </p>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Dashboard Name</Label>
              <Input id="name" name="name" required placeholder="My Dashboard" />
            </div>

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? 'Creating...' : 'Create Dashboard'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
