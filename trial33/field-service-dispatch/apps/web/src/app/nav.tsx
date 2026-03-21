import Link from 'next/link';

// TRACED: FD-REQ-WO-002 — Navigation component in root layout
export function Nav() {
  return (
    <nav className="border-b bg-background" aria-label="Main navigation">
      <div className="container mx-auto flex h-16 items-center px-4">
        <Link href="/" className="text-lg font-semibold">
          Field Service Dispatch
        </Link>
        <div className="ml-8 flex gap-6">
          <Link href="/dispatch" className="text-sm hover:underline">
            Dispatch
          </Link>
          <Link href="/technicians" className="text-sm hover:underline">
            Technicians
          </Link>
          <Link href="/work-orders" className="text-sm hover:underline">
            Work Orders
          </Link>
          <Link href="/settings" className="text-sm hover:underline">
            Settings
          </Link>
        </div>
      </div>
    </nav>
  );
}
