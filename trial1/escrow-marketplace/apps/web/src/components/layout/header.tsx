'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { StatusBadge } from '@/components/ui/status-badge';

export function Header() {
  const { user, logout, isAuthenticated } = useAuth();

  const dashboardPath = user
    ? user.role === 'ADMIN'
      ? '/admin'
      : user.role === 'PROVIDER'
        ? '/provider'
        : '/buyer'
    : '/login';

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <Link href={dashboardPath} className="flex items-center gap-2">
            <span className="text-xl font-bold text-gray-900">CPM</span>
            <span className="hidden sm:inline text-sm text-gray-500">
              Conditional Payment Marketplace
            </span>
          </Link>
        </div>

        {isAuthenticated && user ? (
          <div className="flex items-center gap-4">
            <Link
              href={dashboardPath}
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              Dashboard
            </Link>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700">{user.displayName}</span>
              <StatusBadge status={user.role} />
            </div>
            <button
              onClick={logout}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Register
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
