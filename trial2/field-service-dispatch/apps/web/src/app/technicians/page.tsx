'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '@/lib/api';
import DynamicMap from '@/components/map/DynamicMap';
import type { MapMarker } from '@/components/map/DynamicMap';

interface Technician {
  id: string;
  userId: string;
  skills: string[];
  status: string;
  currentLat: number | null;
  currentLng: number | null;
  user: { name: string; email: string };
}

interface TechWorkOrder {
  id: string;
  title: string;
  status: string;
  priority: string;
  address: string;
  scheduledAt: string | null;
}

const STATUS_COLORS: Record<string, string> = {
  AVAILABLE: '#66bb6a',
  BUSY: '#ffa726',
  OFF_DUTY: '#9e9e9e',
  ON_BREAK: '#42a5f5',
};

const SKILL_COLORS: Record<string, string> = {
  plumbing: 'blue',
  hvac: 'red',
  electrical: 'gold',
  default: 'green',
};

export default function TechniciansPage() {
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Technician | null>(null);
  const [workOrders, setWorkOrders] = useState<TechWorkOrder[]>([]);

  const fetchTechnicians = useCallback(async () => {
    try {
      const data = await apiFetch<Technician[]>('/technicians');
      setTechnicians(data);
    } catch (err) {
      console.error('Failed to fetch technicians:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTechnicians();
  }, [fetchTechnicians]);

  const selectTechnician = async (tech: Technician) => {
    setSelected(tech);
    try {
      const wo = await apiFetch<TechWorkOrder[]>(`/technicians/${tech.id}/work-orders`);
      setWorkOrders(wo);
    } catch {
      setWorkOrders([]);
    }
  };

  const markers: MapMarker[] = technicians
    .filter(t => t.currentLat && t.currentLng)
    .map(t => ({
      id: t.id,
      lat: t.currentLat!,
      lng: t.currentLng!,
      label: t.user.name,
      color: SKILL_COLORS[t.skills[0] || 'default'] || SKILL_COLORS.default,
      popupContent: `${t.user.name} - ${t.status} (${t.skills.join(', ')})`,
    }));

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading technicians...</div>;
  }

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <div style={{ width: '360px', borderRight: '1px solid #e0e0e0', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '16px', borderBottom: '1px solid #e0e0e0', background: '#1976d2', color: '#fff' }}>
          <h2 style={{ margin: 0, fontSize: '18px' }}>Technicians ({technicians.length})</h2>
        </div>
        <div style={{ flex: 1, overflow: 'auto' }}>
          {technicians.map(tech => (
            <div
              key={tech.id}
              onClick={() => selectTechnician(tech)}
              style={{
                padding: '12px 16px',
                borderBottom: '1px solid #f0f0f0',
                cursor: 'pointer',
                background: selected?.id === tech.id ? '#e3f2fd' : '#fff',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 600, fontSize: '14px' }}>{tech.user.name}</span>
                <span style={{
                  fontSize: '11px',
                  padding: '2px 8px',
                  borderRadius: '10px',
                  background: STATUS_COLORS[tech.status] || '#999',
                  color: '#fff',
                }}>
                  {tech.status.replace(/_/g, ' ')}
                </span>
              </div>
              <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>{tech.user.email}</div>
              <div style={{ display: 'flex', gap: '4px', marginTop: '6px', flexWrap: 'wrap' }}>
                {tech.skills.map(skill => (
                  <span key={skill} style={{
                    fontSize: '10px',
                    padding: '1px 6px',
                    borderRadius: '8px',
                    background: '#e3f2fd',
                    color: '#1565c0',
                  }}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: '0 0 50%', position: 'relative' }}>
          <DynamicMap markers={markers} height="100%" />
        </div>
        <div style={{ flex: 1, overflow: 'auto', padding: '20px' }}>
          {selected ? (
            <div>
              <h3 style={{ margin: '0 0 16px 0' }}>{selected.user.name} - Assigned Work Orders</h3>
              {workOrders.length === 0 ? (
                <p style={{ color: '#999' }}>No work orders assigned</p>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #e0e0e0', textAlign: 'left' }}>
                      <th style={{ padding: '8px' }}>Title</th>
                      <th style={{ padding: '8px' }}>Status</th>
                      <th style={{ padding: '8px' }}>Priority</th>
                      <th style={{ padding: '8px' }}>Address</th>
                      <th style={{ padding: '8px' }}>Scheduled</th>
                    </tr>
                  </thead>
                  <tbody>
                    {workOrders.map(wo => (
                      <tr key={wo.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                        <td style={{ padding: '8px', fontWeight: 600 }}>{wo.title}</td>
                        <td style={{ padding: '8px' }}>{wo.status.replace(/_/g, ' ')}</td>
                        <td style={{ padding: '8px' }}>{wo.priority}</td>
                        <td style={{ padding: '8px' }}>{wo.address}</td>
                        <td style={{ padding: '8px' }}>{wo.scheduledAt ? new Date(wo.scheduledAt).toLocaleString() : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#999' }}>
              Select a technician to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
