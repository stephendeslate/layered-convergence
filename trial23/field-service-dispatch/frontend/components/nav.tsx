import Link from 'next/link';

export function Nav() {
  return (
    <nav className="border-b border-[var(--border)] bg-[var(--card)]" aria-label="Main navigation">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-lg font-bold text-[var(--foreground)]">
              FSD
            </Link>
            <div className="flex space-x-4">
              <Link href="/work-orders" className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
                Work Orders
              </Link>
              <Link href="/technicians" className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
                Technicians
              </Link>
              <Link href="/customers" className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
                Customers
              </Link>
              <Link href="/invoices" className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
                Invoices
              </Link>
              <Link href="/routes" className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
                Routes
              </Link>
              <Link href="/gps-events" className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
                GPS Events
              </Link>
            </div>
          </div>
          <div className="flex space-x-4">
            <Link href="/login" className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
              Login
            </Link>
            <Link href="/register" className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
              Register
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
