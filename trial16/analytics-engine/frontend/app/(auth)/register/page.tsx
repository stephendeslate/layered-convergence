'use client';

import { useActionState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { registerAction } from '@/app/actions';

interface RegisterState {
  error: string | null;
  success: boolean;
}

async function handleRegister(
  _prevState: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  try {
    await registerAction(formData);
    return { error: null, success: true };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : 'Registration failed',
      success: false,
    };
  }
}

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(handleRegister, {
    error: null,
    success: false,
  });

  return (
    <div className="flex min-h-[600px] items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create Account</CardTitle>
          <CardDescription>
            Register for a new analytics engine account
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
                Registration successful! Redirecting...
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="John Doe"
                required
                autoComplete="name"
              />
            </div>
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
                autoComplete="new-password"
                minLength={8}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tenantId">Organization ID</Label>
              <Input
                id="tenantId"
                name="tenantId"
                type="text"
                placeholder="Your organization identifier"
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? 'Creating account...' : 'Create Account'}
            </Button>
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <a href="/login" className="text-primary hover:underline">
                Sign in
              </a>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
