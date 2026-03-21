'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { StatusBadge } from '@/components/work-order/status-badge';
import { TECH_STATUS_COLORS } from '@/lib/constants';
import { api } from '@/lib/api';
import { getInitials, serviceTypeLabel, formatDate, formatTime } from '@/lib/utils';
import type { TechnicianDto, WorkOrderDto, RouteDto } from '@fsd/shared';

export default function TechnicianDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [tech, setTech] = useState<TechnicianDto | null>(null);
  const [workOrders, setWorkOrders] = useState<WorkOrderDto[]>([]);
  const [route, setRoute] = useState<RouteDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<TechnicianDto>(`/technicians/${id}`),
      api.get<WorkOrderDto[]>(`/technicians/${id}/work-orders?date=${new Date().toISOString().split('T')[0]}`).catch(() => []),
      api.get<RouteDto>(`/technicians/${id}/route?date=${new Date().toISOString().split('T')[0]}`).catch(() => null),
    ]).then(([t, wo, r]) => {
      setTech(t);
      setWorkOrders(Array.isArray(wo) ? wo : []);
      setRoute(r);
    }).finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading || !tech) {
    return (
      <div className="p-6 space-y-4">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="h-48 bg-gray-200 rounded animate-pulse" />
      </div>
    );
  }

  const statusConfig = TECH_STATUS_COLORS[tech.status];
  const initials = getInitials(tech.user.firstName, tech.user.lastName);

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-4xl mx-auto">
      <Link href="/technicians" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Back to Technicians
      </Link>

      {/* Profile Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-5">
            <div className="relative">
              <Avatar className="h-16 w-16">
                <AvatarFallback
                  className="text-xl font-bold"
                  style={{ backgroundColor: tech.color + '25', color: tech.color }}
                >
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span
                className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white ${statusConfig.dot}`}
              />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">
                {tech.user.firstName} {tech.user.lastName}
              </h1>
              <p className="text-gray-500">{tech.user.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className={`w-2.5 h-2.5 rounded-full ${statusConfig.dot}`} />
                <span className="text-sm font-medium">{statusConfig.label}</span>
              </div>
            </div>
          </div>

          <Separator className="my-5" />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Phone</span>
              <p className="font-medium">{tech.user.phone || '-'}</p>
            </div>
            <div>
              <span className="text-gray-500">Max Jobs/Day</span>
              <p className="font-medium">{tech.maxJobsPerDay}</p>
            </div>
            <div>
              <span className="text-gray-500">Vehicle</span>
              <p className="font-medium">{tech.vehicleInfo || '-'}</p>
            </div>
            <div>
              <span className="text-gray-500">Last Position</span>
              <p className="font-medium">
                {tech.lastPositionAt
                  ? new Date(tech.lastPositionAt).toLocaleTimeString()
                  : 'No data'}
              </p>
            </div>
          </div>

          <div className="mt-4">
            <span className="text-sm text-gray-500 block mb-2">Skills</span>
            <div className="flex flex-wrap gap-1.5">
              {tech.skills.map((skill) => (
                <Badge key={skill} variant="secondary">{serviceTypeLabel(skill)}</Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Today's Schedule */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Today&apos;s Schedule ({workOrders.length} jobs)</CardTitle>
        </CardHeader>
        <CardContent>
          {workOrders.length > 0 ? (
            <div className="space-y-3">
              {workOrders.map((wo, i) => (
                <Link
                  key={wo.id}
                  href={`/work-orders/${wo.id}`}
                  className="flex items-center gap-4 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-sm font-bold">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{wo.referenceNumber}</span>
                      <StatusBadge status={wo.status} />
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {serviceTypeLabel(wo.serviceType)} - {wo.address}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 text-right">
                    <div>{formatTime(wo.scheduledStart)}</div>
                    <div>{formatTime(wo.scheduledEnd)}</div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-6">No jobs scheduled for today</p>
          )}
        </CardContent>
      </Card>

      {/* Route Info */}
      {route && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Route</CardTitle>
              <Badge variant={route.optimized ? 'success' : 'outline'}>
                {route.optimized ? 'Optimized' : 'Not Optimized'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500">Total Distance</span>
              <span className="font-medium">
                {route.totalDistanceMeters
                  ? `${(route.totalDistanceMeters / 1000).toFixed(1)} km`
                  : '-'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Total Duration</span>
              <span className="font-medium">
                {route.totalDurationSeconds
                  ? `${Math.round(route.totalDurationSeconds / 60)} min`
                  : '-'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Stops</span>
              <span className="font-medium">{route.stops.length}</span>
            </div>
            <div className="pt-2">
              <Link href={`/routes?technician=${id}`}>
                <Button variant="outline" size="sm" className="w-full">
                  View Route on Map
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
