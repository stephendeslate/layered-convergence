'use client';

import { useEffect, useState } from 'react';

interface Dispute {
  id: string;
  reason: string;
  status: string;
  createdAt: string;
  transaction: { id: string; description: string; amount: number };
}

export default function DisputesPage() {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/disputes')
      .then((res) => res.json())
      .then(setDisputes)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-gray-500">Loading disputes...</p>;

  return (
    <div>
      <h2 className="mb-6 text-2xl font-semibold">Disputes</h2>

      {disputes.length === 0 ? (
        <p className="text-gray-500">No disputes.</p>
      ) : (
        <div className="space-y-4">
          {disputes.map((d) => (
            <div key={d.id} className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">{d.reason}</h3>
                <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700">
                  {d.status}
                </span>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Transaction: {d.transaction.description} &middot;
                ${(d.transaction.amount / 100).toFixed(2)}
              </p>
              <p className="mt-1 text-xs text-gray-400">
                Filed {new Date(d.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
