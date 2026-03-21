import Link from 'next/link';

export function Nav() {
  return (
    <nav aria-label="Main navigation" className="border-b border-[var(--border)] bg-[var(--card)]">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold">
          Field Service Dispatch
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/work-orders" className="hover:underline">
            Work Orders
          </Link>
          <Link href="/invoices" className="hover:underline">
            Invoices
          </Link>
          <Link href="/routes" className="hover:underline">
            Routes
          </Link>
          <Link href="/login" className="hover:underline">
            Login
          </Link>
          <Link href="/register" className="hover:underline">
            Register
          </Link>
        </div>
      </div>
    </nav>
  );
}
