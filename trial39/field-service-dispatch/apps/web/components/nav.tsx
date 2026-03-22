// TRACED: FD-UI-NAV-001 — Navigation component in root layout
import Link from 'next/link';

export function Nav() {
  return (
    <nav className="border-b border-[var(--border)] bg-[var(--card)]">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link
          href="/"
          className="text-lg font-bold text-[var(--foreground)]"
        >
          Field Service Dispatch
        </Link>
        <div className="flex items-center gap-6">
          <Link
            href="/work-orders"
            className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
          >
            Work Orders
          </Link>
          <Link
            href="/technicians"
            className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
          >
            Technicians
          </Link>
          <Link
            href="/schedule"
            className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
          >
            Schedule
          </Link>
        </div>
      </div>
    </nav>
  );
}
