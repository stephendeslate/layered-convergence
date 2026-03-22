// TRACED: FD-NAV-COMPONENT
import Link from 'next/link';

export function Nav() {
  return (
    <nav className="border-b border-[var(--border)] bg-[var(--card)]">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-xl font-bold text-[var(--primary)]">
              FSD
            </Link>
            <div className="flex space-x-4">
              <Link
                href="/work-orders"
                className="text-[var(--foreground)] hover:text-[var(--primary)] transition-colors"
              >
                Work Orders
              </Link>
              <Link
                href="/technicians"
                className="text-[var(--foreground)] hover:text-[var(--primary)] transition-colors"
              >
                Technicians
              </Link>
              <Link
                href="/schedules"
                className="text-[var(--foreground)] hover:text-[var(--primary)] transition-colors"
              >
                Schedules
              </Link>
              <Link
                href="/service-areas"
                className="text-[var(--foreground)] hover:text-[var(--primary)] transition-colors"
              >
                Service Areas
              </Link>
            </div>
          </div>
          <Link
            href="/login"
            className="text-[var(--foreground)] hover:text-[var(--primary)] transition-colors"
          >
            Login
          </Link>
        </div>
      </div>
    </nav>
  );
}
