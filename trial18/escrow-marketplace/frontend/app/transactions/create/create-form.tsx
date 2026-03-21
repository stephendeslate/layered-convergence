'use client';

import { useActionState } from 'react';
import { createTransactionAction } from '@/lib/actions';
import type { ActionState } from '@/lib/types';

export function CreateTransactionForm() {
  const [state, action, isPending] = useActionState<ActionState, FormData>(
    createTransactionAction,
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
        <label htmlFor="title" className="block text-sm font-medium mb-1">
          Title
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Transaction title"
        />
      </div>
      <div>
        <label htmlFor="description" className="block text-sm font-medium mb-1">
          Description (optional)
        </label>
        <textarea
          id="description"
          name="description"
          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
          aria-label="Transaction description"
        />
      </div>
      <div>
        <label htmlFor="amount" className="block text-sm font-medium mb-1">
          Amount ($)
        </label>
        <input
          id="amount"
          name="amount"
          type="number"
          step="0.01"
          min="0.01"
          required
          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Transaction amount"
        />
      </div>
      <div>
        <label htmlFor="sellerId" className="block text-sm font-medium mb-1">
          Seller ID
        </label>
        <input
          id="sellerId"
          name="sellerId"
          type="text"
          required
          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Seller ID"
        />
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? 'Creating...' : 'Create Transaction'}
      </button>
    </form>
  );
}
