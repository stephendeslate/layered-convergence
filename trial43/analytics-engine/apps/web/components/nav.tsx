'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

// TRACED:AE-UI-003
const navItems = [
  { href: '/', label: 'Home' },
  { href: '/dashboards', label: 'Dashboards' },
  { href: '/data-sources', label: 'Data Sources' },
  { href: '/events', label: 'Events' },
  { href: '/pipelines', label: 'Pipelines' },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-[var(--border)] bg-[var(--card)]" role="navigation" aria-label="Main navigation">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-6 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-lg font-semibold">
          Analytics Engine
        </Link>
        <div className="flex items-center gap-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'text-sm transition-colors hover:text-[var(--primary)]',
                pathname === item.href
                  ? 'font-medium text-[var(--primary)]'
                  : 'text-[var(--muted-foreground)]',
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>
        <div className="ml-auto">
          <Link
            href="/login"
            className="text-sm text-[var(--muted-foreground)] hover:text-[var(--primary)]"
          >
            Login
          </Link>
        </div>
      </div>
    </nav>
  );
}
