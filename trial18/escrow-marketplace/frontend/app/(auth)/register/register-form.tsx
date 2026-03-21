'use client';

import { useActionState } from 'react';
import { registerAction } from '@/lib/actions';
import type { ActionState } from '@/lib/types';

export function RegisterForm() {
  const [state, action, isPending] = useActionState<ActionState, FormData>(
    registerAction,
    { error: null, success: false },
  );

  return (
    <form action={action} className="space-y-4">
      {state.error && (
        <p className="text-red-600 text-sm" role="alert">
          {state.error}
        </p>
      )}
      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-1">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Email address"
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium mb-1">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Password"
        />
      </div>
      <div>
        <label htmlFor="role" className="block text-sm font-medium mb-1">
          Role
        </label>
        <select
          id="role"
          name="role"
          required
          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Account role"
        >
          <option value="BUYER">Buyer</option>
          <option value="SELLER">Seller</option>
        </select>
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? 'Registering...' : 'Register'}
      </button>
    </form>
  );
}
