import Link from 'next/link';

export function Nav() {
  return (
    <nav aria-label="Main navigation" className="border-b border-[var(--border)] bg-[var(--card)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-lg font-bold">
              Escrow Marketplace
            </Link>
            <div className="flex gap-4">
              <Link href="/transactions" className="text-sm hover:underline">
                Transactions
              </Link>
              <Link href="/disputes" className="text-sm hover:underline">
                Disputes
              </Link>
              <Link href="/payouts" className="text-sm hover:underline">
                Payouts
              </Link>
            </div>
          </div>
          <div className="flex gap-4">
            <Link href="/login" className="text-sm hover:underline">
              Login
            </Link>
            <Link href="/register" className="text-sm hover:underline">
              Register
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
