'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';

// TRACED:AE-UI-003
export function Nav() {
  return (
    <nav className={cn('border-b border-[var(--border)] bg-[var(--card)]')} aria-label="Main navigation">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-lg font-bold text-[var(--foreground)]">
              Analytics Engine
            </Link>
            <div className="hidden md:flex items-center gap-4">
              <Link
                href="/dashboards"
                className={cn(
                  'text-sm font-medium text-[var(--muted-foreground)]',
                  'hover:text-[var(--foreground)] transition-colors',
                )}
              >
                Dashboards
              </Link>
              <Link
                href="/data-sources"
                className={cn(
                  'text-sm font-medium text-[var(--muted-foreground)]',
                  'hover:text-[var(--foreground)] transition-colors',
                )}
              >
                Data Sources
              </Link>
              <Link
                href="/events"
                className={cn(
                  'text-sm font-medium text-[var(--muted-foreground)]',
                  'hover:text-[var(--foreground)] transition-colors',
                )}
              >
                Events
              </Link>
              <Link
                href="/pipelines"
                className={cn(
                  'text-sm font-medium text-[var(--muted-foreground)]',
                  'hover:text-[var(--foreground)] transition-colors',
                )}
              >
                Pipelines
              </Link>
            </div>
          </div>
          <Link
            href="/login"
            className={cn(
              'text-sm font-medium text-[var(--primary)]',
              'hover:text-[var(--primary-foreground)] transition-colors',
            )}
          >
            Login
          </Link>
        </div>
      </div>
    </nav>
  );
}
