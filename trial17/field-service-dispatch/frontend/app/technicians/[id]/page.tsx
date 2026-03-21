import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getTechnician } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { AvailabilityBadge } from '@/components/technicians/availability-badge';
import { WorkOrderCard } from '@/components/work-orders/work-order-card';
import { formatDate } from '@/lib/utils';

interface Props {
  params: Promise<{ id: string }>;
}

async function TechnicianDetail({ id }: { id: string }) {
  let technician;
  try {
    technician = await getTechnician(id);
  } catch {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{technician.name}</h1>
        <AvailabilityBadge availability={technician.availability} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-slate-500">Email</dt>
              <dd className="mt-1">{technician.email}</dd>
            </div>
            {technician.phone && (
              <div>
                <dt className="text-sm font-medium text-slate-500">Phone</dt>
                <dd className="mt-1">{technician.phone}</dd>
              </div>
            )}
            <div>
              <dt className="text-sm font-medium text-slate-500">Skills</dt>
              <dd className="mt-1">{technician.skills.length > 0 ? technician.skills.join(', ') : 'None listed'}</dd>
            </div>
            {technician.latitude && technician.longitude && (
              <div>
                <dt className="text-sm font-medium text-slate-500">Location</dt>
                <dd className="mt-1">{technician.latitude.toFixed(4)}, {technician.longitude.toFixed(4)}</dd>
              </div>
            )}
            <div>
              <dt className="text-sm font-medium text-slate-500">Since</dt>
              <dd className="mt-1">{formatDate(technician.createdAt)}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {technician.workOrders && technician.workOrders.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3">Work Orders ({technician.workOrders.length})</h2>
          <div className="space-y-3" role="list" aria-label="Technician work orders">
            {technician.workOrders.map((wo) => (
              <div key={wo.id} role="listitem">
                <WorkOrderCard workOrder={wo} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default async function TechnicianDetailPage({ params }: Props) {
  const { id } = await params;

  return (
    <Suspense fallback={<div className="animate-pulse space-y-6"><div className="h-8 w-64 bg-slate-200 rounded" /><div className="h-48 bg-slate-200 rounded-lg" /></div>}>
      <TechnicianDetail id={id} />
    </Suspense>
  );
}
