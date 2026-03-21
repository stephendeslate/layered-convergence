'use client';

import { useActionState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { registerAction } from '@/app/actions';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(registerAction, { error: null, success: false });
  const router = useRouter();
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (state.success) {
      router.push('/dashboards');
    }
  }, [state.success, router]);

  useEffect(() => {
    if (state.error && resultRef.current) {
      resultRef.current.focus();
    }
  }, [state.error]);

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Register</CardTitle>
        </CardHeader>
        <CardContent>
          {state.error && (
            <div ref={resultRef} role="alert" tabIndex={-1} className="mb-4 p-3 text-sm text-destructive bg-destructive/10 rounded-md">
              {state.error}
            </div>
          )}
          <form action={formAction} aria-label="Registration form" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" name="name" type="text" required aria-label="Full name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input id="email" name="email" type="email" required aria-label="Email address" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required aria-label="Password" minLength={8} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tenantId">Tenant ID</Label>
              <Input id="tenantId" name="tenantId" type="text" required aria-label="Tenant ID" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select name="role" defaultValue="VIEWER">
                <SelectTrigger aria-label="Select role">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="VIEWER">Viewer</SelectItem>
                  <SelectItem value="EDITOR">Editor</SelectItem>
                  <SelectItem value="ANALYST">Analyst</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full" disabled={isPending} aria-label="Register">
              {isPending ? 'Registering...' : 'Register'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
