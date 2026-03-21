'use client';

import { useActionState, useEffect, useRef } from 'react';
import { loginAction } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import type { ActionState } from '@/lib/types';

const initialState: ActionState = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (state?.error && resultRef.current) {
      resultRef.current.focus();
    }
  }, [state]);

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Sign In</CardTitle>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="space-y-4">
          {state?.error && (
            <div ref={resultRef} tabIndex={-1} role="alert" className="text-sm text-destructive">
              {state.error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required autoComplete="email" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" required autoComplete="current-password" />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? 'Signing in...' : 'Sign In'}
          </Button>
          <p className="text-sm text-muted-foreground">
            {"Don't have an account? "}
            <a href="/register" className="text-primary hover:underline">
              Register
            </a>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
