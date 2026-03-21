'use client';

import { useEffect, useState } from 'react';

interface Transaction {
  id: string;
  amount: number;
  currency: string;
  status: string;
  description: string;
  createdAt: string;
  buyer: { name: string };
  provider: { name: string };
}

const STATUS_COLORS: Record<string, string> = {
  CREATED: 'bg-gray-100 text-gray-700',
  PAYMENT_PENDING: 'bg-yellow-100 text-yellow-700',
  HELD: 'bg-blue-100 text-blue-700',
  RELEASED: 'bg-green-100 text-green-700',
  DISPUTED: 'bg-red-100 text-red-700',
  PAID: 'bg-emerald-100 text-emerald-700',
  REFUNDED: 'bg-orange-100 text-orange-700',
};

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/transactions')
      .then((res) => res.json())
      .then(setTransactions)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-gray-500">Loading transactions...</p>;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Transactions</h2>
        <button className="rounded-md bg-emerald-600 px-4 py-2 text-sm text-white hover:bg-emerald-700">
          New Transaction
        </button>
      </div>

      {transactions.length === 0 ? (
        <p className="text-gray-500">No transactions yet.</p>
      ) : (
        <table className="w-full rounded-lg border border-gray-200 bg-white">
          <thead>
            <tr className="border-b border-gray-200 text-left text-sm text-gray-500">
              <th className="p-4">Description</th>
              <th className="p-4">Amount</th>
              <th className="p-4">Buyer</th>
              <th className="p-4">Provider</th>
              <th className="p-4">Status</th>
              <th className="p-4">Created</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <tr key={tx.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="p-4">
                  <a href={`/transactions/${tx.id}`} className="text-emerald-600 hover:underline">
                    {tx.description}
                  </a>
                </td>
                <td className="p-4 font-medium">
                  ${(tx.amount / 100).toFixed(2)} {tx.currency.toUpperCase()}
                </td>
                <td className="p-4 text-sm">{tx.buyer.name}</td>
                <td className="p-4 text-sm">{tx.provider.name}</td>
                <td className="p-4">
                  <span className={`rounded-full px-2 py-1 text-xs font-medium ${STATUS_COLORS[tx.status] ?? 'bg-gray-100'}`}>
                    {tx.status}
                  </span>
                </td>
                <td className="p-4 text-sm text-gray-500">
                  {new Date(tx.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
