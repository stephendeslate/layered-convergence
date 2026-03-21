'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { disputesApi } from '@/lib/api';
import { StatusBadge } from '@/components/ui/status-badge';
import { PageSkeleton } from '@/components/ui/loading-skeleton';
import { ApiError } from '@/lib/api';
import Link from 'next/link';

export default function BuyerDisputeDetailPage() {
  const params = useParams();
  const queryClient = useQueryClient();
  const id = params.id as string;

  const [evidenceContent, setEvidenceContent] = useState('');
  const [error, setError] = useState('');

  const { data: dispute, isLoading } = useQuery({
    queryKey: ['dispute', id],
    queryFn: () => disputesApi.get(id),
  });

  const submitEvidenceMutation = useMutation({
    mutationFn: () =>
      disputesApi.submitEvidence(id, { content: evidenceContent }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dispute', id] });
      setEvidenceContent('');
      setError('');
    },
    onError: (err) => {
      setError(err instanceof ApiError ? err.message : 'Failed to submit evidence');
    },
  });

  if (isLoading) return <PageSkeleton />;

  if (!dispute) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Dispute not found</p>
        <Link href="/buyer/disputes" className="text-blue-600 hover:text-blue-700 text-sm mt-2 inline-block">
          Back to disputes
        </Link>
      </div>
    );
  }

  const canAddEvidence = dispute.status === 'OPEN' || dispute.status === 'UNDER_REVIEW';

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/buyer/disputes" className="hover:text-gray-700">Disputes</Link>
        <span>/</span>
        <span className="text-gray-900">{id.slice(0, 8)}...</span>
      </div>

      <div className="max-w-3xl space-y-6">
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="flex items-start justify-between mb-4">
            <h1 className="text-xl font-bold text-gray-900">Dispute Details</h1>
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

          <div className="mt-4">
            <Link
              href={`/buyer/transactions/${dispute.transactionId}`}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              View Transaction
            </Link>
          </div>
        </div>

        {/* Evidence */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Evidence</h2>

          {dispute.evidence && dispute.evidence.length > 0 ? (
            <div className="space-y-4 mb-6">
              {dispute.evidence.map((ev) => (
                <div key={ev.id} className="rounded-lg border border-gray-100 p-4">
                  <div className="flex items-center justify-between mb-2">
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
            <p className="text-sm text-gray-500 mb-6">No evidence submitted yet.</p>
          )}

          {canAddEvidence && (
            <div className="space-y-3">
              {error && (
                <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}
              <textarea
                value={evidenceContent}
                onChange={(e) => setEvidenceContent(e.target.value)}
                rows={4}
                placeholder="Describe your evidence (min 10 characters)..."
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button
                onClick={() => submitEvidenceMutation.mutate()}
                disabled={submitEvidenceMutation.isPending || evidenceContent.length < 10}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {submitEvidenceMutation.isPending ? 'Submitting...' : 'Submit Evidence'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
