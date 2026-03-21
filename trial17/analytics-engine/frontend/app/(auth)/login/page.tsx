'use client';

import { useActionState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { loginAction } from '@/app/actions';

interface LoginState {
  error: string | null;
  success: boolean;
}

async function handleLogin(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  try {
    await loginAction(formData);
    return { error: null, success: true };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : 'Login failed',
      success: false,
    };
  }
}

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(handleLogin, {
    error: null,
    success: false,
  });

  return (
    <div className="flex min-h-[600px] items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign In</CardTitle>
          <CardDescription>
            Enter your credentials to access your analytics dashboard
          </CardDescription>
        </CardHeader>
        <form action={formAction}>
          <CardContent className="space-y-4">
            {state.error && (
              <div
                role="alert"
                className="rounded-md bg-destructive/10 p-3 text-sm text-destructive"
              >
                {state.error}
              </div>
            )}
            {state.success && (
              <div
                role="status"
                className="rounded-md bg-green-50 p-3 text-sm text-green-800"
              >
                Login successful! Redirecting...
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                minLength={8}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? 'Signing in...' : 'Sign In'}
            </Button>
            <p className="text-sm text-muted-foreground">
              Don&apos;t have an account?{' '}
              <a href="/register" className="text-primary hover:underline">
                Register
              </a>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
