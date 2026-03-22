// TRACED: EM-FE-002 — Home page with dashboard overview
import { formatCurrency } from '@escrow-marketplace/shared';

export default function HomePage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Escrow Marketplace</h1>
      <p className="text-lg mb-4" style={{ color: 'var(--muted-foreground)' }}>
        Multi-tenant escrow platform for secure transactions
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-lg border p-4" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}>
          <h3 className="font-semibold mb-1">Listings</h3>
          <p style={{ color: 'var(--muted-foreground)' }}>Manage marketplace listings</p>
        </div>
        <div className="rounded-lg border p-4" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}>
          <h3 className="font-semibold mb-1">Transactions</h3>
          <p style={{ color: 'var(--muted-foreground)' }}>View transaction history</p>
        </div>
        <div className="rounded-lg border p-4" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}>
          <h3 className="font-semibold mb-1">Escrows</h3>
          <p style={{ color: 'var(--muted-foreground)' }}>Monitor escrow accounts</p>
        </div>
        <div className="rounded-lg border p-4" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}>
          <h3 className="font-semibold mb-1">Sample Price</h3>
          <p style={{ color: 'var(--muted-foreground)' }}>{formatCurrency(299.99)}</p>
        </div>
      </div>
    </div>
  );
}
