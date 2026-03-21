import { Suspense } from 'react';
import { fetchTechnicians } from '@/lib/api';
import { TechnicianCard } from '@/components/technicians/technician-card';

async function TechniciansList() {
  const technicians = await fetchTechnicians();

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {technicians.length === 0 ? (
        <p className="text-gray-500 col-span-full text-center py-8">No technicians yet.</p>
      ) : (
        technicians.map((tech) => <TechnicianCard key={tech.id} technician={tech} />)
      )}
    </div>
  );
}

export default function TechniciansPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Technicians</h1>
      <Suspense fallback={<div className="animate-pulse h-64 bg-gray-200 rounded" />}>
        <TechniciansList />
      </Suspense>
    </div>
  );
}
