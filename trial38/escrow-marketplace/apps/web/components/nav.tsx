'use client';

import Link from 'next/link';

// TRACED: EM-FE-004 — Navigation component with accessible links

export function Nav() {
  return (
    <nav aria-label="Main navigation" className="border-b bg-card">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link
          href="/"
          className="text-lg font-semibold text-foreground"
        >
          Escrow Marketplace
        </Link>
        <ul className="flex items-center gap-6" role="list">
          <li>
            <Link
              href="/listings"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Listings
            </Link>
          </li>
          <li>
            <Link
              href="/transactions"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Transactions
            </Link>
          </li>
          <li>
            <Link
              href="/escrow"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Escrow
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}
