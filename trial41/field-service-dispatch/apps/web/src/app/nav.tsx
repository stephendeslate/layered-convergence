'use client';

import Link from 'next/link';
import { cn } from '../../lib/utils';

export default function Nav() {
  return (
    <nav className={cn('border-b border-[var(--border)] bg-[var(--card)]')}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex h-16 items-center space-x-8">
          <Link href="/" className="text-lg font-bold text-[var(--foreground)]">
            FSD
          </Link>
          <Link
            href="/dashboard"
            className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          >
            Dashboard
          </Link>
          <Link
            href="/work-orders"
            className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          >
            Work Orders
          </Link>
          <Link
            href="/technicians"
            className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          >
            Technicians
          </Link>
          <Link
            href="/schedules"
            className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          >
            Schedules
          </Link>
          <Link
            href="/service-areas"
            className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          >
            Service Areas
          </Link>
        </div>
      </div>
    </nav>
  );
}
