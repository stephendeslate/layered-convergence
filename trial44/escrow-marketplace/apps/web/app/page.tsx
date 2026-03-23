// TRACED: EM-HOME-001
'use client';

import dynamic from 'next/dynamic';

const DashboardContent = dynamic(() => import('@/components/dashboard'), {
  loading: () => (
    <div role="status" aria-busy="true">
      Loading dashboard...
    </div>
  ),
});

export default function HomePage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Escrow Marketplace</h1>
      <p className="text-[var(--muted-foreground)] mb-8">
        Secure transactions with built-in escrow protection.
      </p>
      <DashboardContent />
    </div>
  );
}
