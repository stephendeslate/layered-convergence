'use client';

import { useActionState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { loginAction } from '@/app/actions';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, { error: null, success: false });
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
          <CardTitle>Login</CardTitle>
        </CardHeader>
        <CardContent>
          {state.error && (
            <div ref={resultRef} role="alert" tabIndex={-1} className="mb-4 p-3 text-sm text-destructive bg-destructive/10 rounded-md">
              {state.error}
            </div>
          )}
          <form action={formAction} aria-label="Login form" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input id="email" name="email" type="email" required aria-label="Email address" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required aria-label="Password" minLength={8} />
            </div>
            <Button type="submit" className="w-full" disabled={isPending} aria-label="Login">
              {isPending ? 'Logging in...' : 'Login'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
