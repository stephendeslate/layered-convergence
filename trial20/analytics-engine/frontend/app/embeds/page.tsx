'use client';

import { useActionState, useRef, useEffect } from 'react';
import { createEmbedAction } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function EmbedsPage() {
  const [state, formAction, isPending] = useActionState(createEmbedAction, null);
  const errorRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (state?.error && errorRef.current) {
      errorRef.current.focus();
    }
  }, [state?.error]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Embeds</h1>

      <Card>
        <CardHeader>
          <CardTitle>Create Embed</CardTitle>
          <CardDescription>Generate an embed link for a dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            {state?.error && (
              <p ref={errorRef} role="alert" tabIndex={-1} className="text-sm text-[var(--destructive)]">
                {state.error}
              </p>
            )}

            <div className="space-y-2">
              <Label htmlFor="dashboardId">Dashboard ID</Label>
              <Input id="dashboardId" name="dashboardId" required placeholder="Dashboard UUID" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiresAt">Expires At</Label>
              <Input id="expiresAt" name="expiresAt" type="datetime-local" required />
            </div>

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? 'Creating...' : 'Create Embed'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
