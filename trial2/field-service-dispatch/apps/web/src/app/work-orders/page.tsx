'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '@/lib/api';

interface WorkOrder {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  serviceType: string;
  address: string;
  lat: number;
  lng: number;
  scheduledAt: string | null;
  completedAt: string | null;
  trackingToken: string | null;
  customer: { name: string; email: string } | null;
  technician: { user: { name: string } } | null;
  createdAt: string;
}

interface StatusHistory {
  id: string;
  fromStatus: string | null;
  toStatus: string;
  note: string | null;
  createdAt: string;
}

const STATUS_COLORS: Record<string, string> = {
  UNASSIGNED: '#9e9e9e',
  ASSIGNED: '#42a5f5',
  EN_ROUTE: '#ffa726',
  ON_SITE: '#ab47bc',
  IN_PROGRESS: '#26a69a',
  COMPLETED: '#66bb6a',
  INVOICED: '#5c6bc0',
  PAID: '#2e7d32',
};

const PRIORITY_COLORS: Record<string, string> = {
  LOW: '#66bb6a',
  NORMAL: '#42a5f5',
  HIGH: '#ffa726',
  URGENT: '#ef5350',
};

export default function WorkOrdersPage() {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<WorkOrder | null>(null);
  const [history, setHistory] = useState<StatusHistory[]>([]);
  const [filterStatus, setFilterStatus] = useState('ALL');

  const fetchWorkOrders = useCallback(async () => {
    try {
      const data = await apiFetch<WorkOrder[]>('/work-orders');
      setWorkOrders(data);
    } catch (err) {
      console.error('Failed to fetch work orders:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWorkOrders();
  }, [fetchWorkOrders]);

  const selectWorkOrder = async (wo: WorkOrder) => {
    setSelected(wo);
    try {
      const h = await apiFetch<StatusHistory[]>(`/work-orders/${wo.id}/history`);
      setHistory(h);
    } catch {
      setHistory([]);
    }
  };

  const filtered = filterStatus === 'ALL'
    ? workOrders
    : workOrders.filter(wo => wo.status === filterStatus);

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading work orders...</div>;
  }

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <div style={{ width: '400px', borderRight: '1px solid #e0e0e0', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '16px', borderBottom: '1px solid #e0e0e0', background: '#1976d2', color: '#fff' }}>
          <h2 style={{ margin: 0, fontSize: '18px' }}>Work Orders ({filtered.length})</h2>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            style={{ marginTop: '8px', padding: '6px', borderRadius: '4px', border: 'none', fontSize: '13px', width: '100%' }}
          >
            <option value="ALL">All Statuses</option>
            {Object.keys(STATUS_COLORS).map(s => (
              <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
            ))}
          </select>
        </div>
        <div style={{ flex: 1, overflow: 'auto' }}>
          {filtered.map(wo => (
            <div
              key={wo.id}
              onClick={() => selectWorkOrder(wo)}
              style={{
                padding: '12px 16px',
                borderBottom: '1px solid #f0f0f0',
                cursor: 'pointer',
                background: selected?.id === wo.id ? '#e3f2fd' : '#fff',
                borderLeft: `4px solid ${PRIORITY_COLORS[wo.priority] || '#999'}`,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 600, fontSize: '14px' }}>{wo.title}</span>
                <span style={{
                  fontSize: '11px',
                  padding: '2px 8px',
                  borderRadius: '10px',
                  background: STATUS_COLORS[wo.status] || '#999',
                  color: '#fff',
                }}>
                  {wo.status.replace(/_/g, ' ')}
                </span>
              </div>
              <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>{wo.customer?.name || 'No customer'}</div>
              <div style={{ fontSize: '11px', color: '#888', marginTop: '2px' }}>{wo.address}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
        {selected ? (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
              <div>
                <h2 style={{ margin: '0 0 8px 0', fontSize: '22px' }}>{selected.title}</h2>
                <span style={{
                  fontSize: '12px',
                  padding: '3px 10px',
                  borderRadius: '12px',
                  background: STATUS_COLORS[selected.status] || '#999',
                  color: '#fff',
                  fontWeight: 600,
                }}>
                  {selected.status.replace(/_/g, ' ')}
                </span>
                <span style={{
                  fontSize: '12px',
                  padding: '3px 10px',
                  borderRadius: '12px',
                  background: PRIORITY_COLORS[selected.priority] || '#999',
                  color: '#fff',
                  fontWeight: 600,
                  marginLeft: '8px',
                }}>
                  {selected.priority}
                </span>
              </div>
              <a href="/dispatch" style={{ fontSize: '13px', color: '#1976d2' }}>Back to Dispatch</a>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
              <div style={{ padding: '16px', background: '#f5f5f5', borderRadius: '6px' }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#666', textTransform: 'uppercase' }}>Customer</h4>
                <div style={{ fontWeight: 600 }}>{selected.customer?.name || 'N/A'}</div>
                <div style={{ fontSize: '13px', color: '#666' }}>{selected.customer?.email || ''}</div>
              </div>
              <div style={{ padding: '16px', background: '#f5f5f5', borderRadius: '6px' }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#666', textTransform: 'uppercase' }}>Technician</h4>
                <div style={{ fontWeight: 600 }}>{selected.technician?.user?.name || 'Unassigned'}</div>
              </div>
              <div style={{ padding: '16px', background: '#f5f5f5', borderRadius: '6px' }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#666', textTransform: 'uppercase' }}>Service Type</h4>
                <div style={{ fontWeight: 600 }}>{selected.serviceType}</div>
              </div>
              <div style={{ padding: '16px', background: '#f5f5f5', borderRadius: '6px' }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#666', textTransform: 'uppercase' }}>Address</h4>
                <div style={{ fontWeight: 600 }}>{selected.address}</div>
              </div>
              <div style={{ padding: '16px', background: '#f5f5f5', borderRadius: '6px' }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#666', textTransform: 'uppercase' }}>Scheduled</h4>
                <div style={{ fontWeight: 600 }}>{selected.scheduledAt ? new Date(selected.scheduledAt).toLocaleString() : 'Not scheduled'}</div>
              </div>
              <div style={{ padding: '16px', background: '#f5f5f5', borderRadius: '6px' }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#666', textTransform: 'uppercase' }}>Tracking Token</h4>
                <div style={{ fontWeight: 600, fontSize: '12px', fontFamily: 'monospace' }}>{selected.trackingToken || 'N/A'}</div>
              </div>
            </div>

            {selected.description && (
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '15px', marginBottom: '8px' }}>Description</h3>
                <p style={{ color: '#444', fontSize: '14px', lineHeight: 1.5 }}>{selected.description}</p>
              </div>
            )}

            <div>
              <h3 style={{ fontSize: '15px', marginBottom: '12px' }}>Status History</h3>
              {history.length === 0 ? (
                <p style={{ color: '#999', fontSize: '13px' }}>No history available</p>
              ) : (
                <div style={{ borderLeft: '2px solid #e0e0e0', paddingLeft: '16px' }}>
                  {history.map(h => (
                    <div key={h.id} style={{ marginBottom: '12px', position: 'relative' }}>
                      <div style={{
                        position: 'absolute',
                        left: '-21px',
                        top: '4px',
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        background: STATUS_COLORS[h.toStatus] || '#999',
                      }} />
                      <div style={{ fontSize: '13px', fontWeight: 600 }}>
                        {h.fromStatus ? `${h.fromStatus.replace(/_/g, ' ')} -> ` : ''}{h.toStatus.replace(/_/g, ' ')}
                      </div>
                      <div style={{ fontSize: '11px', color: '#999' }}>{new Date(h.createdAt).toLocaleString()}</div>
                      {h.note && <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>{h.note}</div>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#999' }}>
            Select a work order to view details
          </div>
        )}
      </div>
    </div>
  );
}
