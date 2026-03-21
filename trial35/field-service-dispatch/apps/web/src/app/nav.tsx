// TRACED: FD-UI-NAV-001 — Main navigation component
'use client';

import Link from 'next/link';

export function Nav() {
  return (
    <nav aria-label="Main navigation" className="border-b border-[var(--border)] bg-[var(--card)]">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="text-lg font-bold text-[var(--foreground)]">
          Field Service Dispatch
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/work-orders" className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
            Work Orders
          </Link>
          <Link href="/technicians" className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
            Technicians
          </Link>
          <Link href="/map" className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
            Map
          </Link>
          <Link href="/settings" className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
            Settings
          </Link>
        </div>
      </div>
    </nav>
  );
}
