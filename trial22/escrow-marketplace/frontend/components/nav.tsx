// TRACED:UI-006 — Nav component in root layout

'use client';

import Link from 'next/link';

export function Nav() {
  return (
    <nav className="border-b bg-background" aria-label="Main navigation">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link
          href="/"
          className="text-xl font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
        >
          Escrow Marketplace
        </Link>

        <div className="flex items-center gap-6">
          <Link
            href="/transactions"
            className="text-sm font-medium text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
          >
            Transactions
          </Link>
          <Link
            href="/disputes"
            className="text-sm font-medium text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
          >
            Disputes
          </Link>
          <Link
            href="/payouts"
            className="text-sm font-medium text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
          >
            Payouts
          </Link>
          <Link
            href="/login"
            className="text-sm font-medium text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="text-sm font-medium text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
          >
            Register
          </Link>
        </div>
      </div>
    </nav>
  );
}
