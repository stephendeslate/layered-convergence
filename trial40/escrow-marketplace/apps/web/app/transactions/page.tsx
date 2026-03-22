// TRACED: EM-FE-006 — Transactions page with Server Actions
import { fetchTransactions } from '../../lib/actions';
import { formatCurrency } from '@escrow-marketplace/shared';

export default async function TransactionsPage() {
  const transactions = await fetchTransactions();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Transactions</h1>
      {transactions.length === 0 ? (
        <p style={{ color: 'var(--muted-foreground)' }}>No transactions found.</p>
      ) : (
        <div className="grid gap-4">
          {transactions.map((tx: { id: string; amount: string; status: string; createdAt: string }) => (
            <div
              key={tx.id}
              className="rounded-lg border p-4"
              style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}
            >
              <div className="flex justify-between items-center">
                <span className="font-semibold">{formatCurrency(tx.amount)}</span>
                <span className="text-sm px-2 py-1 rounded" style={{ backgroundColor: 'var(--secondary)' }}>
                  {tx.status}
                </span>
              </div>
              <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>
                ID: {tx.id}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
