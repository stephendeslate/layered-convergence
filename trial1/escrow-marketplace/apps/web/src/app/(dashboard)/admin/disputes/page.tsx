'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { adminApi } from '@/lib/api';
import { DataTable } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { TableSkeleton } from '@/components/ui/loading-skeleton';
import { DisputeStatus } from '@cpm/shared';
import type { DisputeDto } from '@cpm/shared';

const STATUS_OPTIONS = [
  { label: 'All', value: '' },
  { label: 'Open', value: DisputeStatus.OPEN },
  { label: 'Under Review', value: DisputeStatus.UNDER_REVIEW },
  { label: 'Released', value: DisputeStatus.RESOLVED_RELEASED },
  { label: 'Refunded', value: DisputeStatus.RESOLVED_REFUNDED },
  { label: 'Escalated', value: DisputeStatus.ESCALATED },
  { label: 'Closed', value: DisputeStatus.CLOSED },
];

export default function AdminDisputesPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-disputes', { page, status: statusFilter }],
    queryFn: () =>
      adminApi.listDisputes({
        page,
        limit: 20,
        status: statusFilter || undefined,
      }),
  });

  const columns = [
    {
      key: 'id',
      header: 'ID',
      render: (d: DisputeDto) => (
        <span className="text-gray-500 font-mono text-xs">{d.id.slice(0, 8)}...</span>
      ),
    },
    {
      key: 'reason',
      header: 'Reason',
      render: (d: DisputeDto) => (
        <span className="text-gray-900 font-medium">
          {d.reason.replace(/_/g, ' ')}
        </span>
      ),
    },
    {
      key: 'description',
      header: 'Description',
      render: (d: DisputeDto) => (
        <span className="text-gray-600">
          {d.description.length > 50 ? d.description.slice(0, 50) + '...' : d.description}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (d: DisputeDto) => <StatusBadge status={d.status} />,
    },
    {
      key: 'transactionId',
      header: 'Transaction',
      render: (d: DisputeDto) => (
        <span className="text-gray-500 font-mono text-xs">{d.transactionId.slice(0, 8)}...</span>
      ),
    },
    {
      key: 'date',
      header: 'Filed',
      render: (d: DisputeDto) => (
        <span className="text-gray-500 text-xs">
          {new Date(d.createdAt).toLocaleDateString()}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dispute Queue</h1>
        <p className="mt-1 text-sm text-gray-500">
          Review and resolve platform disputes
        </p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {STATUS_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => {
              setStatusFilter(opt.value);
              setPage(1);
            }}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              statusFilter === opt.value
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <TableSkeleton cols={6} />
      ) : (
        <DataTable
          columns={columns}
          data={data?.data ?? []}
          keyExtractor={(d) => d.id}
          onRowClick={(d) => router.push(`/admin/disputes/${d.id}`)}
          emptyTitle="No disputes"
          emptyDescription="No disputes found with the current filters."
          page={data?.page}
          totalPages={data?.totalPages}
          onPageChange={setPage}
          total={data?.total}
        />
      )}
    </div>
  );
}
