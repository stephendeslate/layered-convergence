// TRACED: EM-FE-004 — Home page with dynamic escrow stats
import dynamic from 'next/dynamic';
import { formatCurrency } from '@escrow-marketplace/shared';

const EscrowStats = dynamic(() => import('@/components/escrow-stats'), {
  loading: () => (
    <div role="status" aria-busy="true">
      <span className="sr-only">Loading escrow statistics...</span>
      <div className="animate-pulse h-32 rounded-lg bg-[var(--muted)]" />
    </div>
  ),
});

export default function HomePage() {
  const platformStats = {
    totalVolume: formatCurrency(1250000),
    activeListings: 342,
    completedTransactions: 1847,
  };

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-3xl font-bold tracking-tight">
          Escrow Marketplace
        </h1>
        <p className="mt-2 text-[var(--muted-foreground)]">
          Secure multi-tenant marketplace with built-in escrow protection.
        </p>
      </section>

      <EscrowStats
        totalVolume={platformStats.totalVolume}
        activeListings={platformStats.activeListings}
        completedTransactions={platformStats.completedTransactions}
      />

      <section className="grid gap-6 md:grid-cols-3">
        <div className="rounded-lg border border-[var(--border)] p-6">
          <h2 className="text-lg font-semibold">Browse Listings</h2>
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">
            Discover items from verified sellers across all tenants.
          </p>
        </div>
        <div className="rounded-lg border border-[var(--border)] p-6">
          <h2 className="text-lg font-semibold">Track Transactions</h2>
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">
            Monitor your purchases and sales in real time.
          </p>
        </div>
        <div className="rounded-lg border border-[var(--border)] p-6">
          <h2 className="text-lg font-semibold">Escrow Protection</h2>
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">
            Funds held securely until transaction completion.
          </p>
        </div>
      </section>
    </div>
  );
}
