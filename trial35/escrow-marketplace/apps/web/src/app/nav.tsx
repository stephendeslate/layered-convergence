// TRACED: EM-UI-NAV-001 — Main navigation component
'use client';

import Link from 'next/link';

export function Nav() {
  return (
    <nav aria-label="Main navigation" className="border-b border-[var(--border)] bg-[var(--card)]">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="text-lg font-bold text-[var(--foreground)]">
          Escrow Marketplace
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/listings" className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
            Listings
          </Link>
          <Link href="/transactions" className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
            Transactions
          </Link>
          <Link href="/disputes" className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
            Disputes
          </Link>
          <Link href="/settings" className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
            Settings
          </Link>
        </div>
      </div>
    </nav>
  );
}
