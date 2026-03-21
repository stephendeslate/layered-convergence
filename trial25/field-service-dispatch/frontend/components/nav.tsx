// [TRACED:UI-004] Nav component with aria-label="Main navigation"
import Link from 'next/link';

export function Nav() {
  return (
    <nav aria-label="Main navigation" className="border-b border-[var(--border)] bg-[var(--card)]">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-lg font-bold text-[var(--foreground)]">
          Field Service Dispatch
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/work-orders" className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
            Work Orders
          </Link>
          <Link href="/technicians" className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
            Technicians
          </Link>
          <Link href="/routes" className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
            Routes
          </Link>
          <Link href="/invoices" className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
            Invoices
          </Link>
          <Link href="/login" className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
            Login
          </Link>
          <Link href="/register" className="rounded-md bg-[var(--primary)] px-3 py-1.5 text-sm text-[var(--primary-foreground)]">
            Register
          </Link>
        </div>
      </div>
    </nav>
  );
}
