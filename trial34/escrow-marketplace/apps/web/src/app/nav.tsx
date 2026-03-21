'use client';

import Link from 'next/link';
import { truncate } from '@escrow-marketplace/shared';

// TRACED: EM-UI-NAV-001 — Navigation component with aria-label
// TRACED: EM-CQ-TRUNC-002 — truncate used in frontend nav for long titles
export function Nav() {
  const projectTitle = truncate('Escrow Marketplace Platform', 22);

  return (
    <nav aria-label="Main navigation" className="border-b bg-background px-6 py-3">
      <div className="flex items-center gap-6">
        <Link href="/" className="text-lg font-semibold">{projectTitle}</Link>
        <Link href="/listings" className="text-muted-foreground hover:text-foreground">Listings</Link>
        <Link href="/transactions" className="text-muted-foreground hover:text-foreground">Transactions</Link>
        <Link href="/disputes" className="text-muted-foreground hover:text-foreground">Disputes</Link>
        <Link href="/settings" className="text-muted-foreground hover:text-foreground">Settings</Link>
      </div>
    </nav>
  );
}
