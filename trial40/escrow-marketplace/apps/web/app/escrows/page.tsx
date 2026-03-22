// TRACED: EM-FE-007 — Escrows page with Server Actions
import { fetchEscrows } from '../../lib/actions';
import { formatCurrency } from '@escrow-marketplace/shared';

export default async function EscrowsPage() {
  const escrows = await fetchEscrows();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Escrow Accounts</h1>
      {escrows.length === 0 ? (
        <p style={{ color: 'var(--muted-foreground)' }}>No escrow accounts found.</p>
      ) : (
        <div className="grid gap-4">
          {escrows.map((escrow: { id: string; amount: string; transactionId: string }) => (
            <div
              key={escrow.id}
              className="rounded-lg border p-4"
              style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}
            >
              <div className="flex justify-between items-center">
                <span className="font-semibold">{formatCurrency(escrow.amount)}</span>
                <span className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                  TX: {escrow.transactionId}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
