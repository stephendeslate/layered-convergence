// TRACED: EM-UI-001 — Navigation component with accessible links
import Link from 'next/link';

export function Nav() {
  return (
    <nav className="border-b px-4 py-3" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}>
      <div className="container mx-auto flex items-center gap-6">
        <Link href="/" className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>
          Escrow Marketplace
        </Link>
        <div className="flex gap-4">
          <Link href="/listings" className="hover:underline" style={{ color: 'var(--muted-foreground)' }}>
            Listings
          </Link>
          <Link href="/transactions" className="hover:underline" style={{ color: 'var(--muted-foreground)' }}>
            Transactions
          </Link>
          <Link href="/escrows" className="hover:underline" style={{ color: 'var(--muted-foreground)' }}>
            Escrows
          </Link>
          <Link href="/disputes" className="hover:underline" style={{ color: 'var(--muted-foreground)' }}>
            Disputes
          </Link>
        </div>
      </div>
    </nav>
  );
}
