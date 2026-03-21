import Link from 'next/link';

// TRACED: EM-REQ-ESC-002 — Navigation component in root layout
export function Nav() {
  return (
    <nav className="border-b bg-background" aria-label="Main navigation">
      <div className="container mx-auto flex h-16 items-center px-4">
        <Link href="/" className="text-lg font-semibold">
          Escrow Marketplace
        </Link>
        <div className="ml-8 flex gap-6">
          <Link href="/escrow" className="text-sm hover:underline">
            Escrow
          </Link>
          <Link href="/transactions" className="text-sm hover:underline">
            Transactions
          </Link>
          <Link href="/disputes" className="text-sm hover:underline">
            Disputes
          </Link>
          <Link href="/settings" className="text-sm hover:underline">
            Settings
          </Link>
        </div>
      </div>
    </nav>
  );
}
