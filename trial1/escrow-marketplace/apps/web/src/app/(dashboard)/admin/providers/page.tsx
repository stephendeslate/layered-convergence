'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import { DataTable } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { TableSkeleton } from '@/components/ui/loading-skeleton';
import type { UserDto, OnboardingStatusDto } from '@cpm/shared';

type ProviderWithAccount = UserDto & { connectedAccount?: OnboardingStatusDto };

export default function AdminProvidersPage() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-providers', { page }],
    queryFn: () => adminApi.listProviders({ page, limit: 20 }),
  });

  const columns = [
    {
      key: 'displayName',
      header: 'Name',
      render: (p: ProviderWithAccount) => (
        <span className="text-gray-900 font-medium">{p.displayName}</span>
      ),
    },
    {
      key: 'email',
      header: 'Email',
      render: (p: ProviderWithAccount) => (
        <span className="text-gray-600">{p.email}</span>
      ),
    },
    {
      key: 'onboarding',
      header: 'Onboarding',
      render: (p: ProviderWithAccount) => (
        <StatusBadge
          status={p.connectedAccount?.onboardingStatus ?? 'NOT_STARTED'}
        />
      ),
    },
    {
      key: 'charges',
      header: 'Charges',
      render: (p: ProviderWithAccount) => (
        <span className={`text-xs font-medium ${p.connectedAccount?.chargesEnabled ? 'text-green-600' : 'text-gray-400'}`}>
          {p.connectedAccount?.chargesEnabled ? 'Enabled' : 'Disabled'}
        </span>
      ),
    },
    {
      key: 'payouts',
      header: 'Payouts',
      render: (p: ProviderWithAccount) => (
        <span className={`text-xs font-medium ${p.connectedAccount?.payoutsEnabled ? 'text-green-600' : 'text-gray-400'}`}>
          {p.connectedAccount?.payoutsEnabled ? 'Enabled' : 'Disabled'}
        </span>
      ),
    },
    {
      key: 'joined',
      header: 'Joined',
      render: (p: ProviderWithAccount) => (
        <span className="text-gray-500 text-xs">
          {new Date(p.createdAt).toLocaleDateString()}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Providers</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage provider accounts and onboarding status
        </p>
      </div>

      {isLoading ? (
        <TableSkeleton cols={6} />
      ) : (
        <DataTable
          columns={columns}
          data={data?.data ?? []}
          keyExtractor={(p) => p.id}
          emptyTitle="No providers"
          emptyDescription="No providers have registered yet."
          page={data?.page}
          totalPages={data?.totalPages}
          onPageChange={setPage}
          total={data?.total}
        />
      )}
    </div>
  );
}
