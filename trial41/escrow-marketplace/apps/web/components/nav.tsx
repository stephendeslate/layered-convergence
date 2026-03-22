// TRACED:EM-UI-05 navigation component in layout
import Link from 'next/link';
import { cn } from '@/lib/utils';

export function Nav() {
  return (
    <nav className={cn('border-b border-neutral-200 bg-white px-6 py-4')}>
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <Link href="/" className="text-xl font-bold text-neutral-900">
          Escrow Marketplace
        </Link>
        <div className="flex gap-6">
          <Link href="/listings" className="text-sm text-neutral-600 hover:text-neutral-900">
            Listings
          </Link>
          <Link href="/transactions" className="text-sm text-neutral-600 hover:text-neutral-900">
            Transactions
          </Link>
          <Link href="/escrows" className="text-sm text-neutral-600 hover:text-neutral-900">
            Escrows
          </Link>
          <Link href="/disputes" className="text-sm text-neutral-600 hover:text-neutral-900">
            Disputes
          </Link>
        </div>
      </div>
    </nav>
  );
}
