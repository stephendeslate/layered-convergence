import { Suspense } from 'react';
import { fetchTechnician } from '@/lib/api';
import { AvailabilityBadge } from '@/components/technicians/availability-badge';

async function TechnicianDetail({ id }: { id: string }) {
  const technician = await fetchTechnician(id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{technician.name}</h1>
        <AvailabilityBadge available={technician.available} />
      </div>

      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h2 className="text-sm font-medium text-gray-500">Email</h2>
            <p className="mt-1">{technician.email}</p>
          </div>
          <div>
            <h2 className="text-sm font-medium text-gray-500">Phone</h2>
            <p className="mt-1">{technician.phone}</p>
          </div>
        </div>

        <div>
          <h2 className="text-sm font-medium text-gray-500">Specialties</h2>
          <div className="mt-1 flex flex-wrap gap-2">
            {technician.specialties.map((s) => (
              <span
                key={s}
                className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>

      <a href="/technicians" className="inline-block text-blue-600 hover:underline">
        Back to Technicians
      </a>
    </div>
  );
}

export default async function TechnicianDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <Suspense fallback={<div className="animate-pulse h-64 bg-gray-200 rounded" />}>
      <TechnicianDetail id={id} />
    </Suspense>
  );
}
