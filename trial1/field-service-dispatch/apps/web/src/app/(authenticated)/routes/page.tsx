'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { MapView } from '@/components/map/map-view';
import { TechnicianMarker } from '@/components/map/technician-marker';
import { RoutePolyline } from '@/components/map/route-polyline';
import { api } from '@/lib/api';
import { formatDistance, formatDuration, formatTime, serviceTypeLabel } from '@/lib/utils';
import type { TechnicianDto, RouteDto, RouteOptimizationResponse } from '@fsd/shared';

export default function RoutesPage() {
  const [technicians, setTechnicians] = useState<TechnicianDto[]>([]);
  const [selectedTechId, setSelectedTechId] = useState('');
  const [route, setRoute] = useState<RouteDto | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [savings, setSavings] = useState<{ distanceMeters: number; durationSeconds: number } | null>(null);
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    api.get<TechnicianDto[] | { data: TechnicianDto[] }>('/technicians')
      .then((res) => {
        const list = Array.isArray(res) ? res : (res as any).data || [];
        setTechnicians(list);
        if (list.length > 0) setSelectedTechId(list[0].id);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedTechId) return;
    api.get<RouteDto>(`/routes?technicianId=${selectedTechId}&date=${today}`)
      .then(setRoute)
      .catch(() => setRoute(null));
  }, [selectedTechId, today]);

  const selectedTech = technicians.find((t) => t.id === selectedTechId) || null;

  const handleOptimize = async () => {
    if (!selectedTechId) return;
    setIsOptimizing(true);
    setSavings(null);
    try {
      const result = await api.post<RouteOptimizationResponse>('/routes/optimize', {
        technicianId: selectedTechId,
        date: today,
      });
      setRoute(result.route);
      if (result.savings) setSavings(result.savings);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Optimization failed');
    } finally {
      setIsOptimizing(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 lg:px-6 py-3 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-bold text-gray-900">Route Optimization</h1>
          <Select
            value={selectedTechId}
            onChange={(e) => setSelectedTechId(e.target.value)}
            className="w-52"
          >
            <option value="">Select technician</option>
            {technicians.map((t) => (
              <option key={t.id} value={t.id}>
                {t.user.firstName} {t.user.lastName}
              </option>
            ))}
          </Select>
          <span className="text-sm text-gray-500">
            {new Date(today + 'T12:00:00').toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </span>
        </div>
        <Button onClick={handleOptimize} disabled={!selectedTechId || isOptimizing}>
          {isOptimizing ? 'Optimizing...' : 'Optimize Route'}
        </Button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Map */}
        <div className="flex-1 relative">
          <MapView>
            {selectedTech && (
              <TechnicianMarker technician={selectedTech} />
            )}
            {route?.stops && (
              <RoutePolyline stops={route.stops} showStopNumbers />
            )}
          </MapView>
        </div>

        {/* Route details panel */}
        <div className="w-96 border-l border-gray-200 bg-white overflow-y-auto">
          {route ? (
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-gray-900">Route Details</h2>
                <Badge variant={route.optimized ? 'success' : 'outline'}>
                  {route.optimized ? 'Optimized' : 'Original'}
                </Badge>
              </div>

              {/* Summary */}
              <div className="grid grid-cols-2 gap-3">
                <Card>
                  <CardContent className="p-3 text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {route.totalDistanceMeters
                        ? formatDistance(route.totalDistanceMeters)
                        : '-'}
                    </div>
                    <div className="text-xs text-gray-500">Total Distance</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-3 text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {route.totalDurationSeconds
                        ? formatDuration(Math.round(route.totalDurationSeconds / 60))
                        : '-'}
                    </div>
                    <div className="text-xs text-gray-500">Drive Time</div>
                  </CardContent>
                </Card>
              </div>

              {/* Savings */}
              {savings && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                  <div className="text-sm font-semibold text-green-800">
                    Savings: {formatDistance(savings.distanceMeters)} less driving |{' '}
                    {Math.round(savings.durationSeconds / 60)} min saved
                  </div>
                </div>
              )}

              {/* Stops list */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-gray-700">
                  Stops ({route.stops.length})
                </h3>
                {route.stops.map((stop, i) => (
                  <div
                    key={stop.id}
                    className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg"
                  >
                    <div className="w-7 h-7 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      {stop.workOrder ? (
                        <>
                          <div className="text-sm font-medium">
                            {stop.workOrder.referenceNumber}
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            {serviceTypeLabel(stop.workOrder.serviceType)}
                          </div>
                          <div className="text-xs text-gray-400 truncate">
                            {stop.workOrder.address}
                          </div>
                        </>
                      ) : (
                        <div className="text-sm text-gray-400">Work Order</div>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 text-right">
                      {stop.estimatedArrival && (
                        <div>ETA: {formatTime(stop.estimatedArrival)}</div>
                      )}
                      {stop.distanceFromPrevMeters != null && (
                        <div>{formatDistance(stop.distanceFromPrevMeters)}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400 text-sm">
              {selectedTechId
                ? 'No route found for today'
                : 'Select a technician to view their route'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
