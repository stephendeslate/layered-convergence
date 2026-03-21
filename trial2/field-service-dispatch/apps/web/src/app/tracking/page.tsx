'use client';

import { useState, useEffect, useCallback, FormEvent } from 'react';
import { apiFetch } from '@/lib/api';
import DynamicMap from '@/components/map/DynamicMap';
import type { MapMarker } from '@/components/map/DynamicMap';
import { getGpsSocket, disconnectGpsSocket } from '@/lib/socket';

interface TrackingData {
  id: string;
  title: string;
  status: string;
  address: string;
  lat: number;
  lng: number;
  scheduledAt: string | null;
  customer: { name: string } | null;
  technician: {
    id: string;
    currentLat: number | null;
    currentLng: number | null;
    user: { name: string };
  } | null;
}

interface EtaData {
  etaMinutes: number;
  distanceMeters: number;
}

export default function TrackingPage() {
  const [token, setToken] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [tracking, setTracking] = useState<TrackingData | null>(null);
  const [eta, setEta] = useState<EtaData | null>(null);
  const [error, setError] = useState('');
  const [techLat, setTechLat] = useState<number | null>(null);
  const [techLng, setTechLng] = useState<number | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (token.trim()) {
      setSubmitted(true);
    }
  };

  const fetchTracking = useCallback(async () => {
    if (!token) return;
    try {
      const data = await apiFetch<TrackingData>(`/work-orders/tracking/${token}`);
      setTracking(data);
      setError('');
      if (data.technician?.currentLat && data.technician?.currentLng) {
        setTechLat(data.technician.currentLat);
        setTechLng(data.technician.currentLng);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid tracking token');
      setTracking(null);
    }
  }, [token]);

  useEffect(() => {
    if (!submitted) return;
    fetchTracking();
    const interval = setInterval(fetchTracking, 30000);
    return () => clearInterval(interval);
  }, [submitted, fetchTracking]);

  useEffect(() => {
    if (!tracking?.technician?.id) return;

    const socket = getGpsSocket();
    socket.connect();

    socket.on('position', (data: { technicianId: string; lat: number; lng: number }) => {
      if (data.technicianId === tracking.technician!.id) {
        setTechLat(data.lat);
        setTechLng(data.lng);
      }
    });

    socket.on('eta', (data: { workOrderId: string; etaMinutes: number; distanceMeters: number }) => {
      if (data.workOrderId === tracking.id) {
        setEta({ etaMinutes: data.etaMinutes, distanceMeters: data.distanceMeters });
      }
    });

    return () => {
      disconnectGpsSocket();
    };
  }, [tracking?.technician?.id, tracking?.id]);

  if (!submitted) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' }}>
        <div style={{ width: '100%', maxWidth: '440px', padding: '32px', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <h1 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '8px', textAlign: 'center' }}>Track Your Service</h1>
          <p style={{ textAlign: 'center', color: '#666', marginBottom: '24px', fontSize: '14px' }}>
            Enter the tracking token provided by your service company
          </p>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              value={token}
              onChange={e => setToken(e.target.value)}
              placeholder="Enter tracking token"
              required
              style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '15px', marginBottom: '16px', boxSizing: 'border-box' }}
            />
            <button
              type="submit"
              style={{ width: '100%', padding: '12px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '15px', fontWeight: 600, cursor: 'pointer' }}
            >
              Track
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '18px', color: '#c62828', marginBottom: '16px' }}>{error}</div>
          <button onClick={() => { setSubmitted(false); setError(''); }} style={{ padding: '10px 24px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!tracking) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;
  }

  const markers: MapMarker[] = [
    {
      id: 'job',
      lat: tracking.lat,
      lng: tracking.lng,
      label: tracking.title,
      color: 'red',
      popupContent: tracking.address,
    },
  ];

  if (techLat && techLng && tracking.technician) {
    markers.push({
      id: 'tech',
      lat: techLat,
      lng: techLng,
      label: tracking.technician.user.name,
      color: 'blue',
      popupContent: `${tracking.technician.user.name} - Your technician`,
    });
  }

  const statusMessages: Record<string, string> = {
    ASSIGNED: 'Your technician has been assigned and will be on the way soon.',
    EN_ROUTE: 'Your technician is on the way!',
    ON_SITE: 'Your technician has arrived.',
    IN_PROGRESS: 'Work is in progress.',
    COMPLETED: 'The job has been completed.',
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '24px' }}>
      <h1 style={{ fontSize: '22px', textAlign: 'center', marginBottom: '4px' }}>Service Tracking</h1>
      <p style={{ textAlign: 'center', color: '#666', fontSize: '14px', marginBottom: '24px' }}>{tracking.title}</p>

      <div style={{ borderRadius: '8px', overflow: 'hidden', marginBottom: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <DynamicMap markers={markers} height="300px" center={[tracking.lat, tracking.lng]} zoom={14} />
      </div>

      <div style={{ padding: '20px', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', marginBottom: '16px' }}>
        <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>
          {statusMessages[tracking.status] || `Status: ${tracking.status.replace(/_/g, ' ')}`}
        </div>
        {eta && tracking.status === 'EN_ROUTE' && (
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#1976d2', marginBottom: '4px' }}>
            {Math.round(eta.etaMinutes)} min away
          </div>
        )}
        {eta && (
          <div style={{ fontSize: '13px', color: '#666' }}>
            {(eta.distanceMeters / 1000).toFixed(1)} km distance
          </div>
        )}
      </div>

      <div style={{ padding: '16px', background: '#fff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '13px' }}>
          <div>
            <div style={{ color: '#999', marginBottom: '2px' }}>Address</div>
            <div style={{ fontWeight: 600 }}>{tracking.address}</div>
          </div>
          <div>
            <div style={{ color: '#999', marginBottom: '2px' }}>Technician</div>
            <div style={{ fontWeight: 600 }}>{tracking.technician?.user.name || 'Pending assignment'}</div>
          </div>
          <div>
            <div style={{ color: '#999', marginBottom: '2px' }}>Scheduled</div>
            <div style={{ fontWeight: 600 }}>{tracking.scheduledAt ? new Date(tracking.scheduledAt).toLocaleString() : 'TBD'}</div>
          </div>
          <div>
            <div style={{ color: '#999', marginBottom: '2px' }}>Status</div>
            <div style={{ fontWeight: 600 }}>{tracking.status.replace(/_/g, ' ')}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
