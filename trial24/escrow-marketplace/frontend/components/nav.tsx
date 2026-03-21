'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

// [TRACED:UI-003] Nav component with accessible navigation links
export function Nav() {
  return (
    <nav aria-label="Main navigation" className="border-b border-[var(--border)] bg-[var(--card)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="text-lg font-bold text-[var(--foreground)]">
              Escrow Marketplace
            </Link>
            <div className="hidden sm:flex sm:gap-4">
              <Link href="/home">
                <Button variant="ghost" size="sm">Home</Button>
              </Link>
              <Link href="/transactions">
                <Button variant="ghost" size="sm">Transactions</Button>
              </Link>
              <Link href="/disputes">
                <Button variant="ghost" size="sm">Disputes</Button>
              </Link>
              <Link href="/payouts">
                <Button variant="ghost" size="sm">Payouts</Button>
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/login">
              <Button variant="outline" size="sm">Login</Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Register</Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
