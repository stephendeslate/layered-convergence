import Link from 'next/link';

// TRACED: EM-FE-006 — Homepage with accessible navigation cards

export default function HomePage() {
  return (
    <div className="space-y-8">
      <section className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">
          Escrow Marketplace
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          A secure, multi-tenant marketplace with escrow protection for every transaction.
        </p>
      </section>

      <div className="grid gap-6 md:grid-cols-3">
        <Link
          href="/listings"
          className="rounded-lg border bg-card p-6 transition-shadow hover:shadow-md"
        >
          <h2 className="text-xl font-semibold">Browse Listings</h2>
          <p className="mt-2 text-muted-foreground">
            Explore active listings from verified sellers.
          </p>
        </Link>

        <Link
          href="/transactions"
          className="rounded-lg border bg-card p-6 transition-shadow hover:shadow-md"
        >
          <h2 className="text-xl font-semibold">Transactions</h2>
          <p className="mt-2 text-muted-foreground">
            View and manage your purchase history.
          </p>
        </Link>

        <Link
          href="/escrow"
          className="rounded-lg border bg-card p-6 transition-shadow hover:shadow-md"
        >
          <h2 className="text-xl font-semibold">Escrow Accounts</h2>
          <p className="mt-2 text-muted-foreground">
            Track funds held in escrow for active transactions.
          </p>
        </Link>
      </div>
    </div>
  );
}
