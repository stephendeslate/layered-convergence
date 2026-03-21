import { Suspense } from 'react';
import Link from 'next/link';
import { Nav } from '@/components/nav';
import { fetchDisputes } from '@/lib/api';
import { LoadingSkeleton } from '@/components/loading-skeleton';

async function DisputesList() {
  const disputes = await fetchDisputes();

  return (
    <div className="space-y-4">
      {disputes.length === 0 ? (
        <p className="text-gray-500">No disputes found.</p>
      ) : (
        disputes.map((dispute) => (
          <Link
            key={dispute.id}
            href={`/disputes/${dispute.id}`}
            className="block p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">{dispute.reason}</h3>
                <p className="text-sm text-gray-500">
                  Transaction: {dispute.transactionId}
                </p>
              </div>
              <div className="text-right">
                <span className={`inline-block px-2 py-0.5 text-xs rounded ${dispute.resolution ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {dispute.resolution ? 'Resolved' : 'Open'}
                </span>
              </div>
            </div>
          </Link>
        ))
      )}
    </div>
  );
}

export default function DisputesPage() {
  return (
    <>
      <Nav />
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Disputes</h1>
        <Suspense fallback={<LoadingSkeleton />}>
          <DisputesList />
        </Suspense>
      </div>
    </>
  );
}
