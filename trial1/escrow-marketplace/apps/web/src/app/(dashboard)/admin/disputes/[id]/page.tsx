'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { disputesApi } from '@/lib/api';
import { StatusBadge } from '@/components/ui/status-badge';
import { PageSkeleton } from '@/components/ui/loading-skeleton';
import { DisputeStatus } from '@cpm/shared';
import { ApiError } from '@/lib/api';
import Link from 'next/link';

export default function AdminDisputeDetailPage() {
  const params = useParams();
  const queryClient = useQueryClient();
  const id = params.id as string;

  const [resolution, setResolution] = useState<string>(DisputeStatus.RESOLVED_RELEASED);
  const [resolutionNote, setResolutionNote] = useState('');
  const [error, setError] = useState('');

  const { data: dispute, isLoading } = useQuery({
    queryKey: ['dispute', id],
    queryFn: () => disputesApi.get(id),
  });

  const resolveMutation = useMutation({
    mutationFn: () =>
      disputesApi.resolve(id, {
        resolution: resolution as DisputeStatus.RESOLVED_RELEASED | DisputeStatus.RESOLVED_REFUNDED | DisputeStatus.ESCALATED,
        resolutionNote,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dispute', id] });
      setError('');
    },
    onError: (err) => {
      setError(err instanceof ApiError ? err.message : 'Failed to resolve dispute');
    },
  });

  if (isLoading) return <PageSkeleton />;

  if (!dispute) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Dispute not found</p>
        <Link href="/admin/disputes" className="text-blue-600 hover:text-blue-700 text-sm mt-2 inline-block">
          Back to disputes
        </Link>
      </div>
    );
  }

  const canResolve = dispute.status === DisputeStatus.OPEN || dispute.status === DisputeStatus.UNDER_REVIEW;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/admin/disputes" className="hover:text-gray-700">Disputes</Link>
        <span>/</span>
        <span className="text-gray-900">{id.slice(0, 8)}...</span>
      </div>

      <div className="max-w-3xl space-y-6">
        {/* Dispute info */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="flex items-start justify-between mb-4">
            <h1 className="text-xl font-bold text-gray-900">Dispute Review</h1>
            <StatusBadge status={dispute.status} />
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500 font-medium">Reason</p>
              <p className="text-gray-900">{dispute.reason.replace(/_/g, ' ')}</p>
            </div>
            <div>
              <p className="text-gray-500 font-medium">Filed</p>
              <p className="text-gray-900">{new Date(dispute.createdAt).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-gray-500 font-medium">Filed By</p>
              <p className="text-gray-900 font-mono text-xs">{dispute.filedById.slice(0, 12)}...</p>
            </div>
            <div>
              <p className="text-gray-500 font-medium">Transaction</p>
              <Link
                href={`/admin/transactions/${dispute.transactionId}`}
                className="text-blue-600 hover:text-blue-700 font-mono text-xs"
              >
                {dispute.transactionId.slice(0, 12)}...
              </Link>
            </div>
            <div className="col-span-2">
              <p className="text-gray-500 font-medium">Description</p>
              <p className="text-gray-900 mt-1">{dispute.description}</p>
            </div>
            {dispute.resolutionNote && (
              <div className="col-span-2">
                <p className="text-gray-500 font-medium">Resolution Note</p>
                <p className="text-gray-900 mt-1">{dispute.resolutionNote}</p>
              </div>
            )}
          </div>
        </div>

        {/* Evidence */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Evidence</h2>
          {dispute.evidence && dispute.evidence.length > 0 ? (
            <div className="space-y-4">
              {dispute.evidence.map((ev) => (
                <div key={ev.id} className="rounded-lg border border-gray-100 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-500 font-mono">
                      By: {ev.submittedById.slice(0, 8)}...
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(ev.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">{ev.content}</p>
                  {ev.fileName && (
                    <p className="mt-2 text-xs text-blue-600">{ev.fileName}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No evidence submitted</p>
          )}
        </div>

        {/* Resolve form */}
        {canResolve && (
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Resolve Dispute</h2>

            {error && (
              <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Resolution</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setResolution(DisputeStatus.RESOLVED_RELEASED)}
                    className={`rounded-lg border-2 p-3 text-center text-sm transition-colors ${
                      resolution === DisputeStatus.RESOLVED_RELEASED
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium">Release to Provider</div>
                    <div className="text-xs mt-1 text-gray-500">Provider wins</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setResolution(DisputeStatus.RESOLVED_REFUNDED)}
                    className={`rounded-lg border-2 p-3 text-center text-sm transition-colors ${
                      resolution === DisputeStatus.RESOLVED_REFUNDED
                        ? 'border-orange-500 bg-orange-50 text-orange-700'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium">Refund Buyer</div>
                    <div className="text-xs mt-1 text-gray-500">Buyer wins</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setResolution(DisputeStatus.ESCALATED)}
                    className={`rounded-lg border-2 p-3 text-center text-sm transition-colors ${
                      resolution === DisputeStatus.ESCALATED
                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium">Escalate</div>
                    <div className="text-xs mt-1 text-gray-500">To Stripe dispute</div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Resolution Note (min 10 characters)
                </label>
                <textarea
                  value={resolutionNote}
                  onChange={(e) => setResolutionNote(e.target.value)}
                  rows={4}
                  placeholder="Explain the resolution decision..."
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <button
                onClick={() => resolveMutation.mutate()}
                disabled={resolveMutation.isPending || resolutionNote.length < 10}
                className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {resolveMutation.isPending ? 'Resolving...' : 'Submit Resolution'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
