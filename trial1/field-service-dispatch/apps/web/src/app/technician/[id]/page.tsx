'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { api } from '@/lib/api';
import { formatTime, formatDate, serviceTypeLabel } from '@/lib/utils';
import { STATUS_COLORS, PRIORITY_COLORS } from '@/lib/constants';
import { WorkOrderStatus, WORK_ORDER_TRANSITIONS } from '@fsd/shared';
import type { WorkOrderDto, TechnicianDto, RouteDto } from '@fsd/shared';

type TechnicianWithRoute = TechnicianDto & { route: RouteDto | null };

const STATUS_ACTION_MAP: Record<string, { label: string; next: WorkOrderStatus; color: string }> = {
  [WorkOrderStatus.ASSIGNED]: {
    label: 'Start Route',
    next: WorkOrderStatus.EN_ROUTE,
    color: 'bg-blue-600 hover:bg-blue-700 text-white',
  },
  [WorkOrderStatus.EN_ROUTE]: {
    label: 'Arrived',
    next: WorkOrderStatus.ON_SITE,
    color: 'bg-orange-600 hover:bg-orange-700 text-white',
  },
  [WorkOrderStatus.ON_SITE]: {
    label: 'Start Work',
    next: WorkOrderStatus.IN_PROGRESS,
    color: 'bg-yellow-600 hover:bg-yellow-700 text-white',
  },
  [WorkOrderStatus.IN_PROGRESS]: {
    label: 'Complete Job',
    next: WorkOrderStatus.COMPLETED,
    color: 'bg-green-600 hover:bg-green-700 text-white',
  },
};

export default function TechnicianMobilePage() {
  const params = useParams();
  const techId = params.id as string;

  const [technician, setTechnician] = useState<TechnicianWithRoute | null>(null);
  const [workOrders, setWorkOrders] = useState<WorkOrderDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeWO, setActiveWO] = useState<WorkOrderDto | null>(null);
  const [notes, setNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  useEffect(() => {
    loadData();
  }, [techId]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [tech, wos] = await Promise.all([
        api.get<TechnicianWithRoute>(`/technicians/${techId}`),
        api.get<WorkOrderDto[]>(`/technicians/${techId}/work-orders?date=${new Date().toISOString().slice(0, 10)}`),
      ]);
      setTechnician(tech);
      setWorkOrders(wos);
      // Auto-select the first active job
      const active = wos.find(
        (wo) =>
          wo.status === WorkOrderStatus.EN_ROUTE ||
          wo.status === WorkOrderStatus.ON_SITE ||
          wo.status === WorkOrderStatus.IN_PROGRESS,
      );
      if (active) setActiveWO(active);
    } catch {
      // Use demo data on error
      setWorkOrders([
        {
          id: 'demo-1',
          companyId: '',
          customerId: '',
          technicianId: techId,
          referenceNumber: 'WO-00142',
          status: WorkOrderStatus.ASSIGNED,
          priority: 'HIGH' as any,
          serviceType: 'HVAC_REPAIR' as any,
          description: 'AC unit not cooling properly. Customer reports warm air.',
          notes: null,
          address: '742 Evergreen Terrace',
          city: 'Springfield',
          state: 'IL',
          zipCode: '62704',
          latitude: 39.7817,
          longitude: -89.6501,
          scheduledStart: new Date().toISOString(),
          scheduledEnd: new Date(Date.now() + 3600000).toISOString(),
          estimatedMinutes: 60,
          actualStart: null,
          actualEnd: null,
          trackingToken: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'demo-2',
          companyId: '',
          customerId: '',
          technicianId: techId,
          referenceNumber: 'WO-00143',
          status: WorkOrderStatus.ASSIGNED,
          priority: 'MEDIUM' as any,
          serviceType: 'PLUMBING_REPAIR' as any,
          description: 'Leaking kitchen faucet, steady drip.',
          notes: null,
          address: '1234 Oak Street',
          city: 'Springfield',
          state: 'IL',
          zipCode: '62702',
          latitude: 39.79,
          longitude: -89.64,
          scheduledStart: new Date(Date.now() + 7200000).toISOString(),
          scheduledEnd: new Date(Date.now() + 10800000).toISOString(),
          estimatedMinutes: 45,
          actualStart: null,
          actualEnd: null,
          trackingToken: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (wo: WorkOrderDto, newStatus: WorkOrderStatus) => {
    const allowed = WORK_ORDER_TRANSITIONS[wo.status];
    if (!allowed?.includes(newStatus)) return;

    setIsUpdating(true);
    try {
      await api.patch(`/work-orders/${wo.id}/status`, { status: newStatus });
      if (notes.trim()) {
        await api.patch(`/work-orders/${wo.id}`, { notes: notes.trim() });
      }
      await loadData();
      setNotes('');
    } catch {
      alert('Failed to update status');
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePhotoUpload = async (woId: string) => {
    if (!photoFile) return;
    setIsUpdating(true);
    try {
      const formData = new FormData();
      formData.append('file', photoFile);
      await api.upload(`/work-orders/${woId}/photos`, formData);
      setPhotoFile(null);
      alert('Photo uploaded');
    } catch {
      alert('Failed to upload photo');
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 space-y-4">
        <div className="h-10 bg-gray-200 rounded animate-pulse" />
        <div className="h-40 bg-gray-200 rounded animate-pulse" />
        <div className="h-40 bg-gray-200 rounded animate-pulse" />
      </div>
    );
  }

  const activeJob = activeWO || workOrders[0];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="bg-blue-600 text-white px-4 py-3 sticky top-0 z-30">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-lg font-bold">
              {technician
                ? `${technician.user.firstName} ${technician.user.lastName}`
                : 'Technician'}
            </div>
            <div className="text-blue-100 text-sm">
              {formatDate(new Date().toISOString())} &middot; {workOrders.length} jobs today
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant="secondary"
              className="bg-blue-500 text-white border-0"
            >
              {technician?.status?.replace('_', ' ') || 'AVAILABLE'}
            </Badge>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4 pb-24">
        {/* Today's Jobs */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
            Today&apos;s Schedule
          </h2>
          {workOrders.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-gray-500">
                No jobs scheduled for today
              </CardContent>
            </Card>
          ) : (
            workOrders.map((wo, index) => {
              const isActive = activeJob?.id === wo.id;
              const statusColors = STATUS_COLORS[wo.status] || { bg: 'bg-gray-100', text: 'text-gray-700' };
              const priorityColors = PRIORITY_COLORS[wo.priority] || { bg: 'bg-gray-100', text: 'text-gray-700' };
              const action = STATUS_ACTION_MAP[wo.status];

              return (
                <Card
                  key={wo.id}
                  className={`transition-all ${isActive ? 'ring-2 ring-blue-500 shadow-lg' : ''}`}
                  onClick={() => setActiveWO(wo)}
                >
                  <CardContent className="p-4 space-y-3">
                    {/* Job Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-gray-400">#{index + 1}</span>
                        <span className="font-semibold text-sm">{wo.referenceNumber}</span>
                        <Badge className={`${priorityColors.bg} ${priorityColors.text} border-0 text-xs`}>
                          {wo.priority}
                        </Badge>
                      </div>
                      <Badge className={`${statusColors.bg} ${statusColors.text} border-0 text-xs`}>
                        {wo.status.replace('_', ' ')}
                      </Badge>
                    </div>

                    {/* Service Type */}
                    <div className="text-sm font-medium text-gray-800">
                      {serviceTypeLabel(wo.serviceType)}
                    </div>

                    {/* Address */}
                    <div className="text-sm text-gray-600">
                      <div>{wo.address}</div>
                      <div>{wo.city}, {wo.state} {wo.zipCode}</div>
                    </div>

                    {/* Time */}
                    <div className="text-xs text-gray-500">
                      {formatTime(wo.scheduledStart)} - {formatTime(wo.scheduledEnd)}
                      <span className="ml-2">({wo.estimatedMinutes} min)</span>
                    </div>

                    {/* Description */}
                    {wo.description && isActive && (
                      <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                        {wo.description}
                      </div>
                    )}

                    {/* Action Section (only for active job) */}
                    {isActive && (
                      <div className="space-y-3 pt-2 border-t border-gray-100">
                        {/* Notes */}
                        <Textarea
                          placeholder="Add notes about this job..."
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          className="text-sm min-h-[60px]"
                        />

                        {/* Photo Upload */}
                        <div className="flex items-center gap-2">
                          <label className="flex-1">
                            <input
                              type="file"
                              accept="image/*"
                              capture="environment"
                              className="hidden"
                              onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
                            />
                            <div className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 transition-colors">
                              <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                <circle cx="8.5" cy="8.5" r="1.5" />
                                <polyline points="21 15 16 10 5 21" />
                              </svg>
                              <span className="text-sm text-gray-500">
                                {photoFile ? photoFile.name : 'Take Photo'}
                              </span>
                            </div>
                          </label>
                          {photoFile && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handlePhotoUpload(wo.id)}
                              disabled={isUpdating}
                            >
                              Upload
                            </Button>
                          )}
                        </div>

                        {/* Navigation Button */}
                        <a
                          href={`https://www.google.com/maps/dir/?api=1&destination=${wo.latitude},${wo.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 w-full py-3 bg-gray-100 text-gray-700 rounded-lg font-medium text-sm hover:bg-gray-200 transition-colors"
                        >
                          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polygon points="3 11 22 2 13 21 11 13 3 11" />
                          </svg>
                          Navigate
                        </a>

                        {/* Status Update Button */}
                        {action && (
                          <Button
                            className={`w-full py-6 text-lg font-bold ${action.color}`}
                            onClick={() => handleStatusUpdate(wo, action.next)}
                            disabled={isUpdating}
                          >
                            {isUpdating ? 'Updating...' : action.label}
                          </Button>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>

      {/* Bottom Nav Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 flex items-center justify-around z-30">
        <button className="flex flex-col items-center gap-1 py-1 text-blue-600">
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
          </svg>
          <span className="text-xs font-medium">Jobs</span>
        </button>
        <button className="flex flex-col items-center gap-1 py-1 text-gray-400">
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="3 11 22 2 13 21 11 13 3 11" />
          </svg>
          <span className="text-xs">Route</span>
        </button>
        <button className="flex flex-col items-center gap-1 py-1 text-gray-400">
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <span className="text-xs">Messages</span>
        </button>
        <button className="flex flex-col items-center gap-1 py-1 text-gray-400">
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <span className="text-xs">Profile</span>
        </button>
      </div>
    </div>
  );
}
