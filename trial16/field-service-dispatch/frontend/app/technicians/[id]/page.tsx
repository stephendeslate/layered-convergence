import { Suspense } from 'react';
import Link from 'next/link';
import { getTechnician } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { AvailabilityBadge } from '@/components/technicians/availability-badge';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';

interface TechnicianDetailPageProps {
  params: Promise<{ id: string }>;
}

async function TechnicianDetail({ id }: { id: string }) {
  const technician = await getTechnician(id);

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-2 mb-6">
        <Link href="/technicians" className="text-sm text-muted-foreground hover:text-foreground">
          Technicians
        </Link>
        <span className="text-muted-foreground">/</span>
        <span className="text-sm">{technician.name}</span>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start justify-between">
            <CardTitle>{technician.name}</CardTitle>
            <AvailabilityBadge availability={technician.availability} />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
              <p className="mt-1">{technician.email}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Phone</h3>
              <p className="mt-1">{technician.phone}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Joined</h3>
              <p className="mt-1">{formatDate(technician.createdAt)}</p>
            </div>
            {technician.latitude !== null && technician.longitude !== null && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Location</h3>
                <p className="mt-1">
                  {technician.latitude.toFixed(4)}, {technician.longitude.toFixed(4)}
                </p>
              </div>
            )}
          </div>

          {technician.skills.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {technician.skills.map((skill) => (
                  <Badge key={skill} variant="secondary">{skill}</Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {technician.workOrders && technician.workOrders.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Assigned Work Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {technician.workOrders.map((wo) => (
                <li key={wo.id}>
                  <Link
                    href={`/work-orders/${wo.id}`}
                    className="text-sm text-primary hover:underline"
                  >
                    {wo.title} - {wo.status}
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default async function TechnicianDetailPage({ params }: TechnicianDetailPageProps) {
  const { id } = await params;

  return (
    <Suspense fallback={<TechnicianDetailSkeleton />}>
      <TechnicianDetail id={id} />
    </Suspense>
  );
}

function TechnicianDetailSkeleton() {
  return (
    <div className="max-w-3xl space-y-6">
      <div className="h-4 w-48 bg-muted rounded animate-pulse" />
      <div className="space-y-4 border rounded-lg p-6">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-12 bg-muted rounded animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}
