'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { createDataSourceAction } from '@/app/actions';

const DATA_SOURCE_TYPES = ['POSTGRESQL', 'MYSQL', 'CSV', 'API', 'S3'];

export default function NewDataSourcePage() {
  const [state, formAction, isPending] = useActionState(createDataSourceAction, null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">New Data Source</h1>
        <Link href="/data-sources">
          <Button variant="outline">Cancel</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create Data Source</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" placeholder="My Data Source" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select id="type" name="type" required>
                <option value="">Select a type</option>
                {DATA_SOURCE_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </Select>
            </div>
            {state?.error && (
              <p className="text-sm text-[var(--destructive)]">{state.error}</p>
            )}
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Creating...' : 'Create Data Source'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
