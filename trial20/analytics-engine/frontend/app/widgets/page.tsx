'use client';

import { useActionState, useRef, useEffect } from 'react';
import { createWidgetAction } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function WidgetsPage() {
  const [state, formAction, isPending] = useActionState(createWidgetAction, null);
  const errorRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (state?.error && errorRef.current) {
      errorRef.current.focus();
    }
  }, [state?.error]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Widgets</h1>

      <Card>
        <CardHeader>
          <CardTitle>Create Widget</CardTitle>
          <CardDescription>Add a widget to a dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            {state?.error && (
              <p ref={errorRef} role="alert" tabIndex={-1} className="text-sm text-[var(--destructive)]">
                {state.error}
              </p>
            )}

            <div className="space-y-2">
              <Label htmlFor="title">Widget Title</Label>
              <Input id="title" name="title" required placeholder="Revenue Chart" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Widget Type</Label>
              <Select name="type" defaultValue="BAR">
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BAR">Bar Chart</SelectItem>
                  <SelectItem value="LINE">Line Chart</SelectItem>
                  <SelectItem value="PIE">Pie Chart</SelectItem>
                  <SelectItem value="TABLE">Table</SelectItem>
                  <SelectItem value="KPI">KPI Card</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dashboardId">Dashboard ID</Label>
              <Input id="dashboardId" name="dashboardId" required placeholder="Dashboard UUID" />
            </div>

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? 'Creating...' : 'Create Widget'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
