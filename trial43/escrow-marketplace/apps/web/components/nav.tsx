// TRACED: EM-NAV-001
'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';

export function Nav() {
  return (
    <nav className={cn('border-b border-[var(--border)] bg-[var(--card)]')} aria-label="Main navigation">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-6">
        <Link href="/" className="font-bold text-lg text-[var(--primary)]">
          Escrow Marketplace
        </Link>
        <Link href="/listings" className="text-[var(--foreground)] hover:text-[var(--primary)]">
          Listings
        </Link>
        <Link href="/transactions" className="text-[var(--foreground)] hover:text-[var(--primary)]">
          Transactions
        </Link>
        <Link href="/escrows" className="text-[var(--foreground)] hover:text-[var(--primary)]">
          Escrows
        </Link>
        <Link href="/disputes" className="text-[var(--foreground)] hover:text-[var(--primary)]">
          Disputes
        </Link>
        <div className="ml-auto">
          <Link href="/login" className="text-[var(--foreground)] hover:text-[var(--primary)]">
            Login
          </Link>
        </div>
      </div>
    </nav>
  );
}
