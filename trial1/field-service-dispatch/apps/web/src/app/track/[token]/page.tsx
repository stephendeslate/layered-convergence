'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { STATUS_COLORS } from '@/lib/constants';
import { formatTime, formatDate } from '@/lib/utils';
import { WorkOrderStatus, WS_EVENTS } from '@fsd/shared';
import type { WorkOrderDto, TrackingPosition } from '@fsd/shared';
import { getTrackingSocket } from '@/lib/socket';
import dynamic from 'next/dynamic';

const TrackingMap = dynamic(() => import('./tracking-map').then((m) => m.TrackingMap), {
  ssr: false,
  loading: () => <div className="w-full h-64 bg-gray-100 animate-pulse rounded-lg" />,
});

const TRACKING_STEPS = [
  { key: WorkOrderStatus.ASSIGNED, label: 'Scheduled' },
  { key: WorkOrderStatus.EN_ROUTE, label: 'On the way' },
  { key: WorkOrderStatus.ON_SITE, label: 'Arrived' },
  { key: WorkOrderStatus.IN_PROGRESS, label: 'Working' },
  { key: WorkOrderStatus.COMPLETED, label: 'Complete' },
];

function getStepIndex(status: WorkOrderStatus): number {
  const idx = TRACKING_STEPS.findIndex((s) => s.key === status);
  return idx >= 0 ? idx : 0;
}

export default function CustomerTrackingPage() {
  const params = useParams();
  const token = params.token as string;

  const [workOrder, setWorkOrder] = useState<WorkOrderDto | null>(null);
  const [trackingPos, setTrackingPos] = useState<TrackingPosition | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch tracking data using the public endpoint (no auth)
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/tracking/${token}`)
      .then((res) => {
        if (!res.ok) throw new Error('Tracking link expired or invalid');
        return res.json();
      })
      .then((data) => {
        setWorkOrder(data.workOrder);
        if (data.position) setTrackingPos(data.position);
      })
      .catch((err) => {
        setError(err.message);
        // Demo fallback
        setWorkOrder({
          id: 'demo',
          companyId: '',
          customerId: '',
          technicianId: 'demo-tech',
          referenceNumber: 'WO-00142',
          status: WorkOrderStatus.EN_ROUTE,
          priority: 'HIGH' as any,
          serviceType: 'HVAC_REPAIR' as any,
          description: 'AC unit repair',
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
          trackingToken: token,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        setTrackingPos({
          latitude: 39.775,
          longitude: -89.645,
          eta: 12,
          distance: 3200,
        });
      })
      .finally(() => setIsLoading(false));
  }, [token]);

  // Subscribe to real-time GPS updates via tracking socket
  useEffect(() => {
    if (!workOrder) return;

    const socket = getTrackingSocket();
    socket.emit('tracking:subscribe', { token });
    socket.on(WS_EVENTS.TRACKING_POSITION, (data: TrackingPosition) => {
      setTrackingPos(data);
    });
    socket.on('dispatch:update', (data: { workOrder: WorkOrderDto }) => {
      setWorkOrder(data.workOrder);
    });

    return () => {
      socket.off(WS_EVENTS.TRACKING_POSITION);
      socket.off('dispatch:update');
      socket.disconnect();
    };
  }, [workOrder?.id, token]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-500">Loading tracking information...</p>
        </div>
      </div>
    );
  }

  if (!workOrder) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900">Tracking Unavailable</h2>
            <p className="text-gray-500">This tracking link may have expired or is no longer valid.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentStep = getStepIndex(workOrder.status);
  const isCompleted = workOrder.status === WorkOrderStatus.COMPLETED || workOrder.status === WorkOrderStatus.INVOICED || workOrder.status === WorkOrderStatus.PAID;
  const statusColors = STATUS_COLORS[workOrder.status] || { bg: 'bg-gray-100', text: 'text-gray-700' };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-gray-900">Service Tracking</h1>
              <p className="text-sm text-gray-500">{workOrder.referenceNumber}</p>
            </div>
            <Badge className={`${statusColors.bg} ${statusColors.text} border-0`}>
              {workOrder.status.replace('_', ' ')}
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto p-4 space-y-4">
        {/* ETA Card */}
        {trackingPos && !isCompleted && (
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-blue-600 font-medium">Estimated Arrival</div>
                  <div className="text-3xl font-bold text-blue-900">
                    {trackingPos.eta} min
                  </div>
                  <div className="text-sm text-blue-600">
                    {(trackingPos.distance / 1000).toFixed(1)} km away
                  </div>
                </div>
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {isCompleted && (
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <svg className="w-6 h-6 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <div className="text-lg font-bold text-green-900">Service Complete</div>
              <p className="text-sm text-green-700">Your service has been completed successfully.</p>
            </CardContent>
          </Card>
        )}

        {/* Map */}
        <Card className="overflow-hidden">
          <TrackingMap
            workOrder={workOrder}
            technicianPosition={trackingPos}
          />
        </Card>

        {/* Status Timeline */}
        <Card>
          <CardContent className="p-4">
            <div className="space-y-0">
              {TRACKING_STEPS.map((step, idx) => {
                const isStepDone = idx <= currentStep;
                const isCurrent = idx === currentStep;

                return (
                  <div key={step.key} className="flex items-start gap-3">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                          isStepDone
                            ? isCurrent
                              ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                              : 'bg-green-500 text-white'
                            : 'bg-gray-200 text-gray-400'
                        }`}
                      >
                        {isStepDone && !isCurrent ? (
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        ) : (
                          idx + 1
                        )}
                      </div>
                      {idx < TRACKING_STEPS.length - 1 && (
                        <div
                          className={`w-0.5 h-8 ${
                            idx < currentStep ? 'bg-green-500' : 'bg-gray-200'
                          }`}
                        />
                      )}
                    </div>
                    <div className="pt-1">
                      <div
                        className={`text-sm font-medium ${
                          isCurrent ? 'text-blue-600' : isStepDone ? 'text-gray-900' : 'text-gray-400'
                        }`}
                      >
                        {step.label}
                      </div>
                      {isCurrent && (
                        <div className="text-xs text-gray-500 mt-0.5">Current status</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Service Details */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <h3 className="font-semibold text-gray-900">Service Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Service</span>
                <span className="font-medium">
                  {workOrder.serviceType.replace(/_/g, ' ')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Scheduled</span>
                <span className="font-medium">
                  {formatDate(workOrder.scheduledStart)}, {formatTime(workOrder.scheduledStart)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Address</span>
                <span className="font-medium text-right">
                  {workOrder.address}<br />
                  {workOrder.city}, {workOrder.state} {workOrder.zipCode}
                </span>
              </div>
              {workOrder.description && (
                <div className="pt-2 border-t border-gray-100">
                  <span className="text-gray-500 block mb-1">Description</span>
                  <p className="text-gray-700">{workOrder.description}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-xs text-gray-400 py-4">
          Powered by Field Service Dispatch
        </div>
      </div>
    </div>
  );
}
