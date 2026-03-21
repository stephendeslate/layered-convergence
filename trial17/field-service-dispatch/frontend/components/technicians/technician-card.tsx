import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { AvailabilityBadge } from './availability-badge';
import type { Technician } from '@/lib/types';

interface TechnicianCardProps {
  technician: Technician;
}

export function TechnicianCard({ technician }: TechnicianCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">
            <Link href={`/technicians/${technician.id}`} className="hover:underline">
              {technician.name}
            </Link>
          </CardTitle>
          <AvailabilityBadge availability={technician.availability} />
        </div>
      </CardHeader>
      <CardContent>
        <dl className="space-y-1 text-sm">
          <div className="flex gap-2">
            <dt className="text-slate-500">Email:</dt>
            <dd>{technician.email}</dd>
          </div>
          {technician.phone && (
            <div className="flex gap-2">
              <dt className="text-slate-500">Phone:</dt>
              <dd>{technician.phone}</dd>
            </div>
          )}
          {technician.skills.length > 0 && (
            <div className="flex gap-2">
              <dt className="text-slate-500">Skills:</dt>
              <dd>{technician.skills.join(', ')}</dd>
            </div>
          )}
          {technician.workOrders && (
            <div className="flex gap-2">
              <dt className="text-slate-500">Active orders:</dt>
              <dd>{technician.workOrders.length}</dd>
            </div>
          )}
        </dl>
      </CardContent>
    </Card>
  );
}
