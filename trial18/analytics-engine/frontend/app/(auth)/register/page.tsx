'use client';

import { useActionState } from 'react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { registerAction } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(registerAction, {
    error: null,
    success: false,
  });

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      router.push('/dashboards');
    }
  }, [state.success, router]);

  return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Register</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" type="text" required aria-label="Full name" />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required aria-label="Email address" />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required minLength={8} aria-label="Password" />
            </div>
            <div>
              <Label htmlFor="tenantId">Tenant ID</Label>
              <Input id="tenantId" name="tenantId" type="text" required aria-label="Tenant ID" />
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <select id="role" name="role" className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm" aria-label="User role">
                <option value="VIEWER">Viewer</option>
                <option value="EDITOR">Editor</option>
                <option value="ANALYST">Analyst</option>
              </select>
            </div>
            {state.error && (
              <p className="text-sm text-destructive" role="alert">{state.error}</p>
            )}
            <Button type="submit" disabled={isPending} className="w-full">
              {isPending ? 'Registering...' : 'Register'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
