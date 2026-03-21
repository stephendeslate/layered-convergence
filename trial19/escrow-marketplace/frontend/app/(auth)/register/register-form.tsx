'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { registerAction } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { ActionState } from '@/lib/types';

export function RegisterForm() {
  const initialState: ActionState = { error: null, success: false };
  const [state, formAction, isPending] = useActionState(registerAction, initialState);
  const resultRef = useRef<HTMLDivElement>(null);
  const [role, setRole] = useState('');

  useEffect(() => {
    if (state.error && resultRef.current) {
      resultRef.current.focus();
    }
  }, [state]);

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Register</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div
            ref={resultRef}
            tabIndex={-1}
            aria-live="polite"
            className="outline-none"
          >
            {state.error && (
              <p className="text-sm text-destructive" role="alert">{state.error}</p>
            )}
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
              minLength={8}
              autoComplete="new-password"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <input type="hidden" name="role" value={role} />
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger id="role">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BUYER">Buyer</SelectItem>
                <SelectItem value="SELLER">Seller</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full" disabled={isPending || !role}>
            {isPending ? 'Registering...' : 'Register'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
