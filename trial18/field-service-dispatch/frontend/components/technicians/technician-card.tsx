import type { Technician } from '@/lib/types';
import { AvailabilityBadge } from './availability-badge';

interface TechnicianCardProps {
  technician: Technician;
}

export function TechnicianCard({ technician }: TechnicianCardProps) {
  return (
    <a
      href={`/technicians/${technician.id}`}
      className="block bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow"
    >
      <div className="flex justify-between items-start">
        <h2 className="font-semibold text-lg">{technician.name}</h2>
        <AvailabilityBadge available={technician.available} />
      </div>
      <p className="text-sm text-gray-600 mt-1">{technician.email}</p>
      <p className="text-sm text-gray-600">{technician.phone}</p>
      <div className="mt-2 flex flex-wrap gap-1">
        {technician.specialties.map((s) => (
          <span
            key={s}
            className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full"
          >
            {s}
          </span>
        ))}
      </div>
    </a>
  );
}
