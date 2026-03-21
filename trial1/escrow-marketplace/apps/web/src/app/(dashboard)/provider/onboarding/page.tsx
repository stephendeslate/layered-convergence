'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { onboardingApi } from '@/lib/api';
import { StatusBadge } from '@/components/ui/status-badge';
import { PageSkeleton } from '@/components/ui/loading-skeleton';
import { ApiError } from '@/lib/api';
import { OnboardingStatus } from '@cpm/shared';
import { useState } from 'react';

export default function ProviderOnboardingPage() {
  const queryClient = useQueryClient();
  const [error, setError] = useState('');

  const { data: status, isLoading } = useQuery({
    queryKey: ['onboarding-status'],
    queryFn: () => onboardingApi.getStatus(),
  });

  const startMutation = useMutation({
    mutationFn: () => onboardingApi.start(),
    onSuccess: (data) => {
      if (data.onboardingUrl) {
        window.location.href = data.onboardingUrl;
      }
    },
    onError: (err) => {
      setError(err instanceof ApiError ? err.message : 'Failed to start onboarding');
    },
  });

  const refreshMutation = useMutation({
    mutationFn: () => onboardingApi.refreshLink(),
    onSuccess: (data) => {
      if (data.onboardingUrl) {
        window.location.href = data.onboardingUrl;
      }
    },
    onError: (err) => {
      setError(err instanceof ApiError ? err.message : 'Failed to refresh onboarding link');
    },
  });

  if (isLoading) return <PageSkeleton />;

  const isComplete = status?.onboardingStatus === OnboardingStatus.COMPLETE;
  const isPending = status?.onboardingStatus === OnboardingStatus.PENDING;
  const isNotStarted = status?.onboardingStatus === OnboardingStatus.NOT_STARTED;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Stripe Onboarding</h1>
        <p className="mt-1 text-sm text-gray-500">
          Connect your Stripe account to receive payments
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="max-w-xl">
        <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Account Status</h2>
            {status && <StatusBadge status={status.onboardingStatus} />}
          </div>

          {isComplete ? (
            <div className="rounded-lg bg-green-50 border border-green-200 p-4 space-y-3">
              <p className="text-sm text-green-800 font-medium">
                Your Stripe account is fully set up!
              </p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-green-600">Charges</p>
                  <p className="font-medium text-green-800">
                    {status?.chargesEnabled ? 'Enabled' : 'Disabled'}
                  </p>
                </div>
                <div>
                  <p className="text-green-600">Payouts</p>
                  <p className="font-medium text-green-800">
                    {status?.payoutsEnabled ? 'Enabled' : 'Disabled'}
                  </p>
                </div>
              </div>
            </div>
          ) : isPending ? (
            <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-4 space-y-3">
              <p className="text-sm text-yellow-800">
                Onboarding is in progress. Please complete the remaining steps on Stripe.
              </p>
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div>
                  <p className="text-yellow-600">Details</p>
                  <p className="font-medium text-yellow-800">
                    {status?.detailsSubmitted ? 'Submitted' : 'Pending'}
                  </p>
                </div>
                <div>
                  <p className="text-yellow-600">Charges</p>
                  <p className="font-medium text-yellow-800">
                    {status?.chargesEnabled ? 'Enabled' : 'Pending'}
                  </p>
                </div>
                <div>
                  <p className="text-yellow-600">Payouts</p>
                  <p className="font-medium text-yellow-800">
                    {status?.payoutsEnabled ? 'Enabled' : 'Pending'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => refreshMutation.mutate()}
                disabled={refreshMutation.isPending}
                className="rounded-lg bg-yellow-600 px-4 py-2 text-sm font-medium text-white hover:bg-yellow-700 disabled:opacity-50"
              >
                {refreshMutation.isPending ? 'Loading...' : 'Continue Onboarding'}
              </button>
            </div>
          ) : (
            <div className="rounded-lg bg-gray-50 border border-gray-200 p-4 space-y-3">
              <p className="text-sm text-gray-700">
                You need to connect a Stripe Express account to receive payments from buyers.
                Stripe handles all identity verification and compliance.
              </p>
              <button
                onClick={() => startMutation.mutate()}
                disabled={startMutation.isPending}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {startMutation.isPending ? 'Starting...' : 'Start Stripe Onboarding'}
              </button>
            </div>
          )}

          {status?.onboardingStatus === OnboardingStatus.RESTRICTED && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-4">
              <p className="text-sm text-red-800 font-medium">
                Your account has restrictions. Please contact support or update your Stripe information.
              </p>
              <button
                onClick={() => refreshMutation.mutate()}
                disabled={refreshMutation.isPending}
                className="mt-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {refreshMutation.isPending ? 'Loading...' : 'Update Information'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
