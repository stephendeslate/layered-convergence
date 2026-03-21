'use client';

import { DemoBanner } from '@/components/layout/demo-banner';
import { Header } from '@/components/layout/header';
import { Sidebar, MobileNav } from '@/components/layout/sidebar';
import { Providers } from '@/app/providers';
import { useAuth } from '@/lib/auth-context';
import { PageSkeleton } from '@/components/ui/loading-skeleton';

function DashboardShell({ children }: { children: React.ReactNode }) {
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <>
        <DemoBanner />
        <div className="p-8">
          <PageSkeleton />
        </div>
      </>
    );
  }

  if (!isAuthenticated) {
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    return null;
  }

  return (
    <>
      <DemoBanner />
      <Header />
      <MobileNav />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <DashboardShell>{children}</DashboardShell>
    </Providers>
  );
}
