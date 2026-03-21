'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { logoutAction } from '@/lib/actions';

export function Nav() {
  return (
    <nav aria-label="Main navigation" className="border-b bg-background">
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        <Link href="/" className="text-lg font-bold">
          Escrow Marketplace
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/transactions" className="text-sm hover:underline">
            Transactions
          </Link>
          <Link href="/disputes" className="text-sm hover:underline">
            Disputes
          </Link>
          <Link href="/payouts" className="text-sm hover:underline">
            Payouts
          </Link>
          <form action={logoutAction}>
            <Button type="submit" variant="outline" size="sm">
              Logout
            </Button>
          </form>
        </div>
      </div>
    </nav>
  );
}
