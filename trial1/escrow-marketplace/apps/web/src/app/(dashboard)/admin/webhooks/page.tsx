'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import { DataTable } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { TableSkeleton } from '@/components/ui/loading-skeleton';

interface WebhookLog {
  id: string;
  stripeEventId: string;
  eventType: string;
  status: string;
  errorMessage: string | null;
  processedAt: string | null;
  createdAt: string;
}

export default function AdminWebhooksPage() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-webhooks', { page }],
    queryFn: () => adminApi.listWebhooks({ page, limit: 20 }),
  });

  const columns = [
    {
      key: 'eventType',
      header: 'Event Type',
      render: (w: WebhookLog) => (
        <span className="text-gray-900 font-mono text-xs">{w.eventType}</span>
      ),
    },
    {
      key: 'stripeEventId',
      header: 'Stripe Event ID',
      render: (w: WebhookLog) => (
        <span className="text-gray-500 font-mono text-xs">{w.stripeEventId.slice(0, 20)}...</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (w: WebhookLog) => <StatusBadge status={w.status} />,
    },
    {
      key: 'error',
      header: 'Error',
      render: (w: WebhookLog) => (
        <span className="text-red-600 text-xs">
          {w.errorMessage ? (w.errorMessage.length > 40 ? w.errorMessage.slice(0, 40) + '...' : w.errorMessage) : '--'}
        </span>
      ),
    },
    {
      key: 'processedAt',
      header: 'Processed',
      render: (w: WebhookLog) => (
        <span className="text-gray-500 text-xs">
          {w.processedAt ? new Date(w.processedAt).toLocaleString() : 'Pending'}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Received',
      render: (w: WebhookLog) => (
        <span className="text-gray-500 text-xs">
          {new Date(w.createdAt).toLocaleString()}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Webhook Logs</h1>
        <p className="mt-1 text-sm text-gray-500">
          Stripe webhook events received and processing status
        </p>
      </div>

      {isLoading ? (
        <TableSkeleton cols={6} />
      ) : (
        <DataTable
          columns={columns}
          data={data?.data ?? []}
          keyExtractor={(w) => w.id}
          emptyTitle="No webhook events"
          emptyDescription="No Stripe webhook events have been received yet."
          page={data?.page}
          totalPages={data?.totalPages}
          onPageChange={setPage}
          total={data?.total}
        />
      )}
    </div>
  );
}
