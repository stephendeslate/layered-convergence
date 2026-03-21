'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { cn } from '@/lib/utils';
import { UserRole } from '@cpm/shared';

interface NavItem {
  label: string;
  href: string;
}

const buyerNav: NavItem[] = [
  { label: 'Dashboard', href: '/buyer' },
  { label: 'My Transactions', href: '/buyer/transactions' },
  { label: 'Create Payment', href: '/buyer/transactions/new' },
  { label: 'Disputes', href: '/buyer/disputes' },
];

const providerNav: NavItem[] = [
  { label: 'Dashboard', href: '/provider' },
  { label: 'Incoming Payments', href: '/provider/payments' },
  { label: 'Payouts', href: '/provider/payouts' },
  { label: 'Onboarding', href: '/provider/onboarding' },
];

const adminNav: NavItem[] = [
  { label: 'Dashboard', href: '/admin' },
  { label: 'All Transactions', href: '/admin/transactions' },
  { label: 'Disputes', href: '/admin/disputes' },
  { label: 'Providers', href: '/admin/providers' },
  { label: 'Webhooks', href: '/admin/webhooks' },
];

export function Sidebar() {
  const { user } = useAuth();
  const pathname = usePathname();

  if (!user) return null;

  let navItems: NavItem[];
  switch (user.role) {
    case UserRole.ADMIN:
      navItems = adminNav;
      break;
    case UserRole.PROVIDER:
      navItems = providerNav;
      break;
    default:
      navItems = buyerNav;
  }

  return (
    <aside className="hidden lg:block w-64 border-r border-gray-200 bg-white">
      <nav className="flex flex-col gap-1 p-4">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== `/${user.role.toLowerCase()}` && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

export function MobileNav() {
  const { user } = useAuth();
  const pathname = usePathname();

  if (!user) return null;

  let navItems: NavItem[];
  switch (user.role) {
    case UserRole.ADMIN:
      navItems = adminNav;
      break;
    case UserRole.PROVIDER:
      navItems = providerNav;
      break;
    default:
      navItems = buyerNav;
  }

  return (
    <nav className="lg:hidden flex gap-1 overflow-x-auto border-b border-gray-200 bg-white px-4 py-2">
      {navItems.map((item) => {
        const isActive =
          pathname === item.href ||
          (item.href !== `/${user.role.toLowerCase()}` && pathname.startsWith(item.href));

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex-shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
              isActive
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-600 hover:bg-gray-50',
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
