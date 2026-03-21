import { Suspense } from 'react';
import { getTechnicians } from '@/lib/api';
import { TechnicianCard } from '@/components/technicians/technician-card';

async function TechnicianList() {
  const technicians = await getTechnicians();

  if (technicians.length === 0) {
    return <p className="text-slate-500">No technicians found.</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" role="list" aria-label="Technicians">
      {technicians.map((tech) => (
        <div key={tech.id} role="listitem">
          <TechnicianCard technician={tech} />
        </div>
      ))}
    </div>
  );
}

export default function TechniciansPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Technicians</h1>
      <Suspense fallback={<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">{[1, 2, 3].map((i) => <div key={i} className="h-40 bg-slate-200 rounded-lg" />)}</div>}>
        <TechnicianList />
      </Suspense>
    </div>
  );
}
