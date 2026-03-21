import { Suspense } from 'react';
import { getWorkOrders } from '@/lib/api';
import { StatusBoard } from '@/components/work-orders/status-board';

async function DashboardContent() {
  const workOrders = await getWorkOrders();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <StatusBoard workOrders={workOrders} />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}

function DashboardSkeleton() {
  return (
    <div>
      <div className="h-8 w-48 bg-muted rounded animate-pulse mb-6" />
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-6 w-24 bg-muted rounded animate-pulse" />
            <div className="h-32 bg-muted rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
