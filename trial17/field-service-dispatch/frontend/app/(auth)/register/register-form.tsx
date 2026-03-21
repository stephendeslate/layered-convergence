'use client';

import { useActionState } from 'react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { registerAction } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function RegisterForm() {
  const router = useRouter();
  const [state, action, isPending] = useActionState(registerAction, {});

  useEffect(() => {
    if ((state as any)?.success) {
      router.push('/');
    }
  }, [state, router]);

  return (
    <form action={action} className="space-y-4">
      {(state as any)?.error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm" role="alert">
          {(state as any).error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input id="name" name="name" required autoComplete="name" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required autoComplete="email" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" required minLength={8} autoComplete="new-password" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="companyName">Company Name</Label>
        <Input id="companyName" name="companyName" required />
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? 'Creating account...' : 'Create Account'}
      </Button>

      <p className="text-sm text-center text-slate-500">
        Already have an account?{' '}
        <Link href="/login" className="text-blue-600 hover:underline">Sign in</Link>
      </p>
    </form>
  );
}
