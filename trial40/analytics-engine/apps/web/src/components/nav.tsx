// TRACED:AE-FE-04 — Nav component in root layout
'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { MAX_PAGE_SIZE } from '@analytics-engine/shared';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/events', label: 'Events' },
  { href: '/dashboards', label: 'Dashboards' },
  { href: '/data-sources', label: 'Data Sources' },
  { href: '/pipelines', label: 'Pipelines' },
];

export function Nav(): React.ReactElement {
  return (
    <nav className={cn('border-b border-[var(--border)] bg-[var(--card)]')} aria-label="Main navigation">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-xl font-bold text-[var(--foreground)]">
              Analytics Engine
            </Link>
            <div className="hidden md:flex md:space-x-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-md px-3 py-2 text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="text-xs text-[var(--muted-foreground)]">
            Max page size: {MAX_PAGE_SIZE}
          </div>
        </div>
      </div>
    </nav>
  );
}
