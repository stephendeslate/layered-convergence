import { Suspense } from 'react';
import { Nav } from '@/components/nav';
import { fetchDispute } from '@/lib/api';
import { LoadingSkeleton } from '@/components/loading-skeleton';

async function DisputeDetail({ id }: { id: string }) {
  const dispute = await fetchDispute(id);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold">Dispute Details</h2>
        <span className={`inline-block mt-2 px-2 py-1 text-sm rounded ${dispute.resolution ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
          {dispute.resolution ? 'Resolved' : 'Open'}
        </span>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-500">Reason</p>
          <p>{dispute.reason}</p>
        </div>
        {dispute.resolution && (
          <div>
            <p className="text-sm text-gray-500">Resolution</p>
            <p>{dispute.resolution}</p>
          </div>
        )}
        <div>
          <p className="text-sm text-gray-500">Transaction</p>
          <p>{dispute.transactionId}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Filed</p>
          <p>{new Date(dispute.createdAt).toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
}

export default async function DisputeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <>
      <Nav />
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Dispute</h1>
        <Suspense fallback={<LoadingSkeleton />}>
          <DisputeDetail id={id} />
        </Suspense>
      </div>
    </>
  );
}
