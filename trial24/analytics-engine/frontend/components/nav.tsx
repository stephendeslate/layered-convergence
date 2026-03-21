// [TRACED:UI-004] Nav component imported in root layout
'use client';

import Link from 'next/link';

const navItems = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/data-sources', label: 'Data Sources' },
  { href: '/pipelines', label: 'Pipelines' },
  { href: '/widgets', label: 'Widgets' },
  { href: '/embeds', label: 'Embeds' },
  { href: '/sync-runs', label: 'Sync Runs' },
  { href: '/data-points', label: 'Data Points' },
];

export function Nav() {
  return (
    <nav aria-label="Main navigation" className="border-b border-[var(--border)] bg-[var(--card)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-[var(--foreground)]">
              Analytics Engine
            </Link>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-md px-3 py-2 text-sm font-medium text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
