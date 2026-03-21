'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';

export function Header() {
  const { tenant, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-gray-200 bg-white px-6">
      <div className="flex items-center gap-4">
        <h2 className="text-sm font-medium text-gray-500">Admin Portal</h2>
      </div>
      <div className="flex items-center gap-3">
        <Link href="/data-sources/new">
          <Button variant="outline" size="sm">
            + Data Source
          </Button>
        </Link>
        <Link href="/dashboards?create=true">
          <Button size="sm">+ Dashboard</Button>
        </Link>
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 rounded-md px-2 py-1 text-sm text-gray-700 hover:bg-gray-50"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-200 text-xs font-medium">
              {tenant?.name?.charAt(0)?.toUpperCase() ?? 'U'}
            </div>
            <span className="max-w-[120px] truncate">{tenant?.email ?? 'User'}</span>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </button>
          {menuOpen && (
            <div className="absolute right-0 mt-1 w-48 rounded-md border border-gray-200 bg-white py-1 shadow-lg">
              <div className="border-b border-gray-100 px-4 py-2">
                <p className="text-sm font-medium text-gray-900">{tenant?.name}</p>
                <p className="text-xs text-gray-500">{tenant?.tier} plan</p>
              </div>
              <Link
                href="/settings/tenant"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                onClick={() => setMenuOpen(false)}
              >
                Account Settings
              </Link>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  logout();
                  window.location.href = '/login';
                }}
                className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-50"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
