'use client';

import { useActionState } from 'react';
import { createWorkOrderAction } from '@/app/actions';
import type { ActionState } from '@/lib/types';

const initialState: ActionState = {};

export function CreateWorkOrderForm() {
  const [state, formAction, isPending] = useActionState(createWorkOrderAction, initialState);

  return (
    <form action={formAction} className="space-y-6 bg-white rounded-lg shadow p-6">
      {state.error && (
        <div role="alert" className="bg-red-50 text-red-700 p-3 rounded-md text-sm">
          {state.error}
        </div>
      )}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Title
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          aria-label="Work order title"
        />
      </div>
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          required
          rows={4}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          aria-label="Work order description"
        />
      </div>
      <div>
        <label htmlFor="customerId" className="block text-sm font-medium text-gray-700">
          Customer ID
        </label>
        <input
          id="customerId"
          name="customerId"
          type="text"
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          aria-label="Customer ID"
        />
      </div>
      <div>
        <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
          Priority (1-5)
        </label>
        <select
          id="priority"
          name="priority"
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          aria-label="Priority level"
        >
          <option value="1">1 - Low</option>
          <option value="2">2</option>
          <option value="3">3 - Medium</option>
          <option value="4">4</option>
          <option value="5">5 - High</option>
        </select>
      </div>
      <div className="flex justify-end space-x-4">
        <a
          href="/work-orders"
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </a>
        <button
          type="submit"
          disabled={isPending}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          aria-label="Create work order"
        >
          {isPending ? 'Creating...' : 'Create Work Order'}
        </button>
      </div>
    </form>
  );
}
