import { Suspense } from 'react';
import { getTechnicians } from '@/lib/api';
import { TechnicianCard } from '@/components/technicians/technician-card';

async function TechnicianList() {
  const technicians = await getTechnicians();

  if (technicians.length === 0) {
    return (
      <p className="text-muted-foreground text-center py-8">
        No technicians found.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {technicians.map((tech) => (
        <TechnicianCard key={tech.id} technician={tech} />
      ))}
    </div>
  );
}

export default function TechniciansPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Technicians</h1>
      <Suspense fallback={<TechnicianListSkeleton />}>
        <TechnicianList />
      </Suspense>
    </div>
  );
}

function TechnicianListSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-40 bg-muted rounded animate-pulse" />
      ))}
    </div>
  );
}
