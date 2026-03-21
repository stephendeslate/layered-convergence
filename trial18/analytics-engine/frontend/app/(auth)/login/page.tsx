'use client';

import { useActionState } from 'react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { loginAction } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, {
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
          <CardTitle>Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required aria-label="Email address" />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required aria-label="Password" />
            </div>
            {state.error && (
              <p className="text-sm text-destructive" role="alert">{state.error}</p>
            )}
            <Button type="submit" disabled={isPending} className="w-full">
              {isPending ? 'Logging in...' : 'Login'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
