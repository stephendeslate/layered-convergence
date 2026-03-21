'use client';

import Link from 'next/link';

// [TRACED:UI-004] Nav component in root layout with keyboard-accessible links
export function Nav() {
  return (
    <nav aria-label="Main navigation" className="border-b border-[var(--border)] bg-[var(--card)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="text-lg font-bold text-[var(--primary)]">
              Analytics Engine
            </Link>
            <Link href="/data-sources" className="text-sm text-[var(--foreground)] hover:text-[var(--primary)]">
              Data Sources
            </Link>
            <Link href="/pipelines" className="text-sm text-[var(--foreground)] hover:text-[var(--primary)]">
              Pipelines
            </Link>
            <Link href="/dashboards" className="text-sm text-[var(--foreground)] hover:text-[var(--primary)]">
              Dashboards
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm text-[var(--foreground)] hover:text-[var(--primary)]">
              Login
            </Link>
            <Link href="/register" className="text-sm rounded-md bg-[var(--primary)] px-3 py-2 text-[var(--primary-foreground)]">
              Register
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
