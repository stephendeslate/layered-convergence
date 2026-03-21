'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { transactionsApi, usersApi } from '@/lib/api';
import { ApiError } from '@/lib/api';
import { PageSkeleton } from '@/components/ui/loading-skeleton';
import { formatCents } from '@/lib/utils';
import {
  MIN_TRANSACTION_AMOUNT_CENTS,
  MAX_TRANSACTION_AMOUNT_CENTS,
  PLATFORM_FEE_PERCENT_DEFAULT,
} from '@cpm/shared';
import Link from 'next/link';

export default function CreateTransactionPage() {
  const router = useRouter();
  const [providerId, setProviderId] = useState('');
  const [amountDollars, setAmountDollars] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const { data: providers, isLoading: providersLoading } = useQuery({
    queryKey: ['providers'],
    queryFn: () => usersApi.listProviders(),
  });

  const amountCents = Math.round(parseFloat(amountDollars || '0') * 100);
  const platformFee = Math.round(amountCents * PLATFORM_FEE_PERCENT_DEFAULT / 100);
  const providerAmount = amountCents - platformFee;

  const isAmountValid =
    amountCents >= MIN_TRANSACTION_AMOUNT_CENTS &&
    amountCents <= MAX_TRANSACTION_AMOUNT_CENTS;

  const createMutation = useMutation({
    mutationFn: () =>
      transactionsApi.create({
        providerId,
        amount: amountCents,
        description,
      }),
    onSuccess: (txn) => {
      router.push(`/buyer/transactions/${txn.id}`);
    },
    onError: (err) => {
      setError(err instanceof ApiError ? err.message : 'Failed to create transaction');
    },
  });

  const canSubmit =
    providerId && isAmountValid && description.length >= 10 && !createMutation.isPending;

  if (providersLoading) {
    return <PageSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/buyer/transactions" className="hover:text-gray-700">
          Transactions
        </Link>
        <span>/</span>
        <span className="text-gray-900">Create Payment</span>
      </div>

      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold text-gray-900">Create Payment Hold</h1>
        <p className="mt-1 text-sm text-gray-500">
          Funds will be held until you confirm delivery or the auto-release timer expires.
        </p>

        {error && (
          <div className="mt-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            setError('');
            createMutation.mutate();
          }}
          className="mt-6 space-y-6"
        >
          {/* Provider selection */}
          <div>
            <label htmlFor="provider" className="block text-sm font-medium text-gray-700">
              Select Provider
            </label>
            <select
              id="provider"
              value={providerId}
              onChange={(e) => setProviderId(e.target.value)}
              required
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Choose a provider...</option>
              {(providers ?? []).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.displayName} ({p.email})
                </option>
              ))}
            </select>
            {providers && providers.length === 0 && (
              <p className="mt-1 text-xs text-yellow-600">
                No providers available. Providers must complete onboarding first.
              </p>
            )}
          </div>

          {/* Amount */}
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
              Amount (USD)
            </label>
            <div className="relative mt-1">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                $
              </span>
              <input
                id="amount"
                type="number"
                step="0.01"
                min="5.00"
                max="10000.00"
                value={amountDollars}
                onChange={(e) => setAmountDollars(e.target.value)}
                required
                placeholder="0.00"
                className="block w-full rounded-lg border border-gray-300 pl-7 pr-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Min $5.00 — Max $10,000.00
            </p>
          </div>

          {/* Fee breakdown */}
          {amountCents > 0 && (
            <div className="rounded-lg bg-gray-50 border border-gray-200 p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Amount</span>
                <span className="font-mono font-medium text-gray-900">{formatCents(amountCents)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Platform Fee ({PLATFORM_FEE_PERCENT_DEFAULT}%)</span>
                <span className="font-mono text-gray-500">-{formatCents(platformFee)}</span>
              </div>
              <div className="border-t border-gray-200 pt-2 flex justify-between text-sm">
                <span className="font-medium text-gray-700">Provider Receives</span>
                <span className="font-mono font-medium text-green-700">{formatCents(providerAmount)}</span>
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              minLength={10}
              maxLength={1000}
              rows={4}
              placeholder="Describe the service or product being purchased..."
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              {description.length}/1000 characters (min 10)
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={!canSubmit}
              className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createMutation.isPending ? 'Creating...' : 'Create Payment Hold'}
            </button>
            <Link
              href="/buyer/transactions"
              className="rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
