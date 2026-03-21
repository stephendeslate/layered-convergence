'use client';

import { Sidebar } from './sidebar';
import { Header } from './header';
import { DemoBanner } from '@/components/common/demo-banner';

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <DemoBanner />
        <Header />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
