// TRACED: EM-FE-011 — Navigation component in root layout
import Link from 'next/link';

export function Nav() {
  return (
    <nav className="border-b border-[var(--border)] bg-[var(--card)]" aria-label="Main navigation">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="text-xl font-bold text-[var(--foreground)]"
        >
          Escrow Marketplace
        </Link>
        <div className="flex items-center gap-6">
          <Link
            href="/listings"
            className="text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
          >
            Listings
          </Link>
          <Link
            href="/transactions"
            className="text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
          >
            Transactions
          </Link>
          <Link
            href="/escrow"
            className="text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
          >
            Escrow
          </Link>
        </div>
      </div>
    </nav>
  );
}
