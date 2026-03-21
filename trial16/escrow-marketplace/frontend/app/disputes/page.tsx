import { Suspense } from 'react';
import { getDisputes } from '@/lib/api';
import { DisputeCard } from '@/components/disputes/dispute-card';
import type { Dispute } from '@/lib/types';

async function DisputeList() {
  let disputes: Dispute[];
  try {
    disputes = await getDisputes();
  } catch {
    disputes = [];
  }

  if (disputes.length === 0) {
    return (
      <p className="py-8 text-center text-gray-500">No disputes found.</p>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {disputes.map((d) => (
        <DisputeCard key={d.id} dispute={d} />
      ))}
    </div>
  );
}

function DisputeListSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
        >
          <div className="space-y-3">
            <div className="h-6 w-3/4 animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function DisputesPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Disputes</h1>

      <Suspense fallback={<DisputeListSkeleton />}>
        <DisputeList />
      </Suspense>
    </div>
  );
}
