'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '@/lib/api';
import DynamicMap from '@/components/map/DynamicMap';
import type { MapMarker, MapRoute } from '@/components/map/DynamicMap';

interface RouteData {
  id: string;
  date: string;
  technicianId: string;
  technician: { user: { name: string } };
  optimizedOrder: number[] | null;
  totalDistanceMeters: number | null;
  totalDurationMinutes: number | null;
  geometry: unknown;
  waypoints: {
    id: string;
    lat: number;
    lng: number;
    order: number;
    workOrder: {
      id: string;
      title: string;
      status: string;
      address: string;
    };
  }[];
}

interface RouteViewerProps {
  routeId: string;
}

const STOP_COLORS = ['red', 'orange', 'gold', 'green', 'blue', 'violet'];

export default function RouteViewer({ routeId }: RouteViewerProps) {
  const [route, setRoute] = useState<RouteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [optimizing, setOptimizing] = useState(false);

  const fetchRoute = useCallback(async () => {
    try {
      const data = await apiFetch<RouteData>(`/routes/${routeId}`);
      setRoute(data);
    } catch (err) {
      console.error('Failed to fetch route:', err);
    } finally {
      setLoading(false);
    }
  }, [routeId]);

  useEffect(() => {
    fetchRoute();
  }, [fetchRoute]);

  const handleOptimize = async () => {
    if (!route) return;
    setOptimizing(true);
    try {
      await apiFetch(`/routes/${route.id}/optimize`, { method: 'POST' });
      await fetchRoute();
    } catch (err) {
      console.error('Optimization failed:', err);
    } finally {
      setOptimizing(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading route...</div>;
  }

  if (!route) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: 'red' }}>Failed to load route</div>;
  }

  const sortedWaypoints = [...route.waypoints].sort((a, b) => a.order - b.order);

  const markers: MapMarker[] = sortedWaypoints.map((wp, idx) => ({
    id: `stop-${wp.id}`,
    lat: wp.lat,
    lng: wp.lng,
    label: `Stop ${idx + 1}: ${wp.workOrder.title}`,
    color: STOP_COLORS[idx % STOP_COLORS.length],
    popupContent: `Stop ${idx + 1}\n${wp.workOrder.title}\n${wp.workOrder.address}\nStatus: ${wp.workOrder.status}`,
  }));

  const routePositions: [number, number][] = sortedWaypoints.map(wp => [wp.lat, wp.lng]);

  const routes: MapRoute[] = routePositions.length >= 2
    ? [{ positions: routePositions, color: '#1976d2', weight: 4 }]
    : [];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <h3 style={{ margin: '0 0 4px 0' }}>Route for {route.technician.user.name}</h3>
          <div style={{ fontSize: '13px', color: '#666' }}>
            {new Date(route.date).toLocaleDateString()} - {sortedWaypoints.length} stops
          </div>
          {route.totalDistanceMeters && (
            <div style={{ fontSize: '13px', color: '#666' }}>
              {(route.totalDistanceMeters / 1000).toFixed(1)} km - ~{Math.round(route.totalDurationMinutes || 0)} min
            </div>
          )}
        </div>
        <button
          onClick={handleOptimize}
          disabled={optimizing}
          style={{
            padding: '8px 16px',
            background: optimizing ? '#bdbdbd' : '#1976d2',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: optimizing ? 'not-allowed' : 'pointer',
            fontWeight: 600,
          }}
        >
          {optimizing ? 'Optimizing...' : 'Optimize Route'}
        </button>
      </div>

      <div style={{ borderRadius: '8px', overflow: 'hidden', marginBottom: '16px' }}>
        <DynamicMap markers={markers} routes={routes} height="400px" />
      </div>

      <div>
        <h4 style={{ marginBottom: '8px' }}>Stops</h4>
        {sortedWaypoints.map((wp, idx) => (
          <div key={wp.id} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '10px 12px',
            borderBottom: '1px solid #f0f0f0',
          }}>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: STOP_COLORS[idx % STOP_COLORS.length],
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '13px',
              flexShrink: 0,
            }}>
              {idx + 1}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: '14px' }}>{wp.workOrder.title}</div>
              <div style={{ fontSize: '12px', color: '#666' }}>{wp.workOrder.address}</div>
            </div>
            <span style={{
              fontSize: '11px',
              padding: '2px 8px',
              borderRadius: '10px',
              background: wp.workOrder.status === 'COMPLETED' ? '#66bb6a' : '#42a5f5',
              color: '#fff',
            }}>
              {wp.workOrder.status.replace(/_/g, ' ')}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
