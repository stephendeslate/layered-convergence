// TRACED:AE-FE-07 — Nav component with accessible navigation

import Link from 'next/link';

export function Nav() {
  return (
    <nav className="border-b bg-card" aria-label="Main navigation">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-xl font-bold text-primary">
          Analytics Engine
        </Link>
        <ul className="flex items-center gap-6" role="list">
          <li>
            <Link
              href="/dashboards"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Dashboards
            </Link>
          </li>
          <li>
            <Link
              href="/pipelines"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Pipelines
            </Link>
          </li>
          <li>
            <Link
              href="/reports"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Reports
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}
