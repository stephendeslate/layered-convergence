import Link from 'next/link';
import type { User } from '@/lib/types';
import { Button } from '@/components/ui/button';

interface NavProps {
  user: User | null;
}

export function Nav({ user }: NavProps) {
  if (!user) {
    return null;
  }

  return (
    <nav aria-label="Main navigation" className="border-b bg-card">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="text-lg font-semibold">
            Field Service Dispatch
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-sm hover:underline focus:outline-none focus:ring-2 focus:ring-ring rounded px-2 py-1">
              Dashboard
            </Link>
            <Link href="/work-orders" className="text-sm hover:underline focus:outline-none focus:ring-2 focus:ring-ring rounded px-2 py-1">
              Work Orders
            </Link>
            <Link href="/customers" className="text-sm hover:underline focus:outline-none focus:ring-2 focus:ring-ring rounded px-2 py-1">
              Customers
            </Link>
            <Link href="/technicians" className="text-sm hover:underline focus:outline-none focus:ring-2 focus:ring-ring rounded px-2 py-1">
              Technicians
            </Link>
            <Link href="/routes" className="text-sm hover:underline focus:outline-none focus:ring-2 focus:ring-ring rounded px-2 py-1">
              Routes
            </Link>
            <Link href="/invoices" className="text-sm hover:underline focus:outline-none focus:ring-2 focus:ring-ring rounded px-2 py-1">
              Invoices
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">{user.email}</span>
          <form action="/api/logout" method="POST">
            <Button variant="outline" size="sm" type="submit">
              Logout
            </Button>
          </form>
        </div>
      </div>
    </nav>
  );
}
