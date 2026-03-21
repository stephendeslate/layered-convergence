import { Suspense } from 'react';
import { Nav } from '@/components/nav';
import { fetchPayouts } from '@/lib/api';
import { LoadingSkeleton } from '@/components/loading-skeleton';

async function PayoutsList() {
  const payouts = await fetchPayouts();

  return (
    <div className="space-y-4">
      {payouts.length === 0 ? (
        <p className="text-gray-500">No payouts found.</p>
      ) : (
        payouts.map((payout) => (
          <div
            key={payout.id}
            className="p-4 bg-white rounded-lg shadow"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="font-mono text-lg">${payout.amount}</p>
                <p className="text-sm text-gray-500">
                  Transaction: {payout.transactionId}
                </p>
              </div>
              <div className="text-right">
                <span className={`inline-block px-2 py-0.5 text-xs rounded ${payout.completedAt ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {payout.completedAt ? 'Completed' : 'Pending'}
                </span>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(payout.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default function PayoutsPage() {
  return (
    <>
      <Nav />
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Payouts</h1>
        <Suspense fallback={<LoadingSkeleton />}>
          <PayoutsList />
        </Suspense>
      </div>
    </>
  );
}
