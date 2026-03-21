// TRACED: AE-UI-NAV-001 — Main navigation component
'use client';

import Link from 'next/link';

export function Nav() {
  return (
    <nav aria-label="Main navigation" className="border-b border-[var(--border)] bg-[var(--card)]">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="text-lg font-bold text-[var(--foreground)]">
          Analytics Engine
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/dashboards" className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
            Dashboards
          </Link>
          <Link href="/pipelines" className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
            Pipelines
          </Link>
          <Link href="/reports" className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
            Reports
          </Link>
          <Link href="/settings" className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
            Settings
          </Link>
        </div>
      </div>
    </nav>
  );
}
