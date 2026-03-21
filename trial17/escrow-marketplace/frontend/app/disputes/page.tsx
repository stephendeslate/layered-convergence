import { Suspense } from 'react';
import { getDisputes } from '@/lib/api';
import { DisputeCard } from '@/components/disputes/dispute-card';

async function DisputesList() {
  const disputes = await getDisputes();

  if (disputes.length === 0) {
    return (
      <p className="text-gray-500 py-8 text-center">
        No disputes found.
      </p>
    );
  }

  return (
    <div className="grid gap-4">
      {disputes.map((dispute) => (
        <DisputeCard key={dispute.id} dispute={dispute} />
      ))}
    </div>
  );
}

export default function DisputesPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold">Disputes</h1>
      <Suspense
        fallback={
          <div role="status" className="flex flex-col gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-28 bg-gray-200 rounded animate-pulse" />
            ))}
            <span className="sr-only">Loading disputes...</span>
          </div>
        }
      >
        <DisputesList />
      </Suspense>
    </div>
  );
}
