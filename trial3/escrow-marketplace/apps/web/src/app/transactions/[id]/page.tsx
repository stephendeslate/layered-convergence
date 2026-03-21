'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

interface StateHistoryEntry {
  id: string;
  fromState: string;
  toState: string;
  reason: string | null;
  timestamp: string;
}

interface TransactionDetail {
  id: string;
  amount: number;
  currency: string;
  status: string;
  description: string;
  platformFee: number;
  holdUntil: string | null;
  createdAt: string;
  buyer: { id: string; name: string; email: string };
  provider: { id: string; name: string; email: string };
  stateHistory: StateHistoryEntry[];
  disputes: { id: string; status: string; reason: string }[];
}

export default function TransactionDetailPage() {
  const params = useParams();
  const [transaction, setTransaction] = useState<TransactionDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/transactions/${params.id}`)
      .then((res) => res.json())
      .then(setTransaction)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) return <p className="text-gray-500">Loading...</p>;
  if (!transaction) return <p className="text-red-500">Transaction not found.</p>;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold">{transaction.description}</h2>
        <p className="mt-1 text-sm text-gray-500">
          ${(transaction.amount / 100).toFixed(2)} {transaction.currency.toUpperCase()} &middot;
          Fee: ${(transaction.platformFee / 100).toFixed(2)}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-xs font-medium uppercase text-gray-400">Status</p>
          <p className="mt-1 text-lg font-semibold">{transaction.status}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-xs font-medium uppercase text-gray-400">Buyer</p>
          <p className="mt-1 font-medium">{transaction.buyer.name}</p>
          <p className="text-sm text-gray-500">{transaction.buyer.email}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-xs font-medium uppercase text-gray-400">Provider</p>
          <p className="mt-1 font-medium">{transaction.provider.name}</p>
          <p className="text-sm text-gray-500">{transaction.provider.email}</p>
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-semibold">State History</h3>
        <div className="space-y-3">
          {transaction.stateHistory.map((entry) => (
            <div key={entry.id} className="flex items-center gap-4 rounded-lg bg-white p-3 text-sm">
              <span className="font-medium text-gray-400">{entry.fromState}</span>
              <span className="text-gray-300">&rarr;</span>
              <span className="font-medium">{entry.toState}</span>
              {entry.reason && <span className="text-gray-500">({entry.reason})</span>}
              <span className="ml-auto text-xs text-gray-400">
                {new Date(entry.timestamp).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>

      {transaction.disputes.length > 0 && (
        <div>
          <h3 className="mb-4 text-lg font-semibold">Disputes</h3>
          {transaction.disputes.map((dispute) => (
            <div key={dispute.id} className="rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="font-medium">{dispute.reason}</p>
              <p className="text-sm text-red-600">{dispute.status}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
