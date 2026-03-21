import Link from 'next/link';
import { logoutAction } from '@/lib/actions';

export function Nav() {
  return (
    <nav aria-label="Main navigation">
      <div className="flex items-center justify-between p-4 border-b bg-white">
        <div className="flex items-center gap-6">
          <Link href="/transactions" className="font-bold text-lg">
            Escrow Marketplace
          </Link>
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
        <form action={logoutAction}>
          <button
            type="submit"
            className="text-sm px-3 py-1 border rounded hover:bg-gray-50"
          >
            Logout
          </button>
        </form>
      </div>
    </nav>
  );
}
