// [TRACED:UI-003] Nav component used in root layout.tsx

'use client';

import Link from 'next/link';

export function Nav() {
  return (
    <nav aria-label="Main navigation" className="border-b border-border bg-card">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link
          href="/"
          className="text-lg font-semibold text-foreground"
        >
          Analytics Engine
        </Link>
        <ul className="flex items-center gap-6" role="list">
          <li>
            <Link
              href="/dashboard"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Dashboards
            </Link>
          </li>
          <li>
            <Link
              href="/data-sources"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Data Sources
            </Link>
          </li>
          <li>
            <Link
              href="/pipelines"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Pipelines
            </Link>
          </li>
          <li>
            <Link
              href="/login"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Login
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}
