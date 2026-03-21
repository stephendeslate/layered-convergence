'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createPipelineAction } from '@/app/actions';

export default function NewPipelinePage() {
  const [state, formAction, isPending] = useActionState(createPipelineAction, null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">New Pipeline</h1>
        <Link href="/pipelines">
          <Button variant="outline">Cancel</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create Pipeline</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" placeholder="My Pipeline" required />
            </div>
            <p className="text-sm text-[var(--muted-foreground)]">
              Pipelines start in DRAFT state. You can transition them through ACTIVE, PAUSED, and ARCHIVED states.
            </p>
            {state?.error && (
              <p className="text-sm text-[var(--destructive)]">{state.error}</p>
            )}
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Creating...' : 'Create Pipeline'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
