'use client';

import { useState, useEffect, useCallback, ChangeEvent } from 'react';
import { apiFetch } from '@/lib/api';

interface MobileWorkOrder {
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
  customer: { name: string; phone: string | null } | null;
}

const STATUS_COLORS: Record<string, string> = {
  ASSIGNED: '#42a5f5',
  EN_ROUTE: '#ffa726',
  ON_SITE: '#ab47bc',
  IN_PROGRESS: '#26a69a',
  COMPLETED: '#66bb6a',
};

const NEXT_STATUS: Record<string, string> = {
  ASSIGNED: 'EN_ROUTE',
  EN_ROUTE: 'ON_SITE',
  ON_SITE: 'IN_PROGRESS',
  IN_PROGRESS: 'COMPLETED',
};

const STATUS_BUTTON_LABELS: Record<string, string> = {
  ASSIGNED: 'Start Route',
  EN_ROUTE: 'Arrived On Site',
  ON_SITE: 'Begin Work',
  IN_PROGRESS: 'Complete Job',
};

export default function MobilePage() {
  const [jobs, setJobs] = useState<MobileWorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeJob, setActiveJob] = useState<MobileWorkOrder | null>(null);
  const [transitioning, setTransitioning] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [note, setNote] = useState('');
  const [techId, setTechId] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    try {
      const profile = await apiFetch<{ id: string; role: string }>('/auth/me');
      if (profile.role === 'TECHNICIAN') {
        const techs = await apiFetch<{ id: string; userId: string }[]>('/technicians');
        const myTech = techs.find(t => t.userId === profile.id);
        if (myTech) {
          setTechId(myTech.id);
          return myTech.id;
        }
      }
    } catch (err) {
      console.error('Failed to fetch profile:', err);
    }
    return null;
  }, []);

  const fetchJobs = useCallback(async (tid: string) => {
    try {
      const data = await apiFetch<MobileWorkOrder[]>(`/technicians/${tid}/work-orders`);
      setJobs(data.filter(j => j.status !== 'COMPLETED' && j.status !== 'INVOICED' && j.status !== 'PAID'));
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile().then(tid => {
      if (tid) fetchJobs(tid);
      else setLoading(false);
    });
  }, [fetchProfile, fetchJobs]);

  const transitionStatus = async (job: MobileWorkOrder) => {
    const nextStatus = NEXT_STATUS[job.status];
    if (!nextStatus) return;

    setTransitioning(true);
    try {
      await apiFetch(`/work-orders/${job.id}/transition`, {
        method: 'POST',
        body: JSON.stringify({ toStatus: nextStatus, note: note || undefined }),
      });
      setNote('');
      if (techId) await fetchJobs(techId);
      if (nextStatus === 'COMPLETED') setActiveJob(null);
      else {
        const updated = jobs.find(j => j.id === job.id);
        if (updated) setActiveJob({ ...updated, status: nextStatus });
      }
    } catch (err) {
      console.error('Transition failed:', err);
    } finally {
      setTransitioning(false);
    }
  };

  const handlePhotoUpload = async (e: ChangeEvent<HTMLInputElement>, jobId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('photo', file);

      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      await fetch(`${API_BASE}/work-orders/${jobId}/photos`, {
        method: 'POST',
        headers: { ...(token && { Authorization: `Bearer ${token}` }) },
        body: formData,
      });
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading your jobs...</div>;
  }

  if (!techId) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>No technician profile found. Please log in as a technician.</p>
        <a href="/login" style={{ color: '#1976d2' }}>Go to Login</a>
      </div>
    );
  }

  if (activeJob) {
    const nextStatus = NEXT_STATUS[activeJob.status];

    return (
      <div style={{ maxWidth: '480px', margin: '0 auto', padding: '16px' }}>
        <button onClick={() => setActiveJob(null)} style={{ background: 'none', border: 'none', color: '#1976d2', cursor: 'pointer', fontSize: '14px', marginBottom: '16px' }}>
          &larr; Back to Jobs
        </button>

        <div style={{ background: '#fff', borderRadius: '8px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <h2 style={{ margin: 0, fontSize: '20px' }}>{activeJob.title}</h2>
            <span style={{
              padding: '4px 10px',
              borderRadius: '12px',
              background: STATUS_COLORS[activeJob.status] || '#999',
              color: '#fff',
              fontSize: '12px',
              fontWeight: 600,
            }}>
              {activeJob.status.replace(/_/g, ' ')}
            </span>
          </div>

          <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>{activeJob.serviceType}</div>
          {activeJob.description && <p style={{ fontSize: '14px', color: '#444', marginBottom: '16px' }}>{activeJob.description}</p>}

          <div style={{ borderTop: '1px solid #eee', paddingTop: '16px', marginBottom: '16px' }}>
            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '12px', color: '#999', marginBottom: '2px' }}>Customer</div>
              <div style={{ fontWeight: 600 }}>{activeJob.customer?.name || 'N/A'}</div>
              {activeJob.customer?.phone && <div style={{ fontSize: '13px', color: '#1976d2' }}>{activeJob.customer.phone}</div>}
            </div>
            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '12px', color: '#999', marginBottom: '2px' }}>Address</div>
              <div style={{ fontWeight: 600 }}>{activeJob.address}</div>
            </div>
            {activeJob.scheduledAt && (
              <div>
                <div style={{ fontSize: '12px', color: '#999', marginBottom: '2px' }}>Scheduled</div>
                <div style={{ fontWeight: 600 }}>{new Date(activeJob.scheduledAt).toLocaleString()}</div>
              </div>
            )}
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>Note (optional)</label>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              rows={2}
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px', resize: 'vertical', boxSizing: 'border-box' }}
            />
          </div>

          {nextStatus && (
            <button
              onClick={() => transitionStatus(activeJob)}
              disabled={transitioning}
              style={{
                width: '100%',
                padding: '14px',
                background: transitioning ? '#bdbdbd' : STATUS_COLORS[nextStatus] || '#1976d2',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                fontSize: '16px',
                fontWeight: 700,
                cursor: transitioning ? 'not-allowed' : 'pointer',
                marginBottom: '12px',
              }}
            >
              {transitioning ? 'Updating...' : STATUS_BUTTON_LABELS[activeJob.status] || 'Update Status'}
            </button>
          )}

          <label style={{
            display: 'block',
            width: '100%',
            padding: '12px',
            background: '#f5f5f5',
            border: '1px dashed #ccc',
            borderRadius: '6px',
            textAlign: 'center',
            cursor: 'pointer',
            fontSize: '14px',
            color: '#666',
          }}>
            {uploading ? 'Uploading...' : 'Upload Photo'}
            <input type="file" accept="image/*" capture="environment" onChange={e => handlePhotoUpload(e, activeJob.id)} style={{ display: 'none' }} />
          </label>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '480px', margin: '0 auto', padding: '16px' }}>
      <h1 style={{ fontSize: '20px', marginBottom: '16px' }}>My Jobs ({jobs.length})</h1>
      {jobs.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#999', marginTop: '48px' }}>No active jobs assigned</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {jobs.map(job => (
            <div
              key={job.id}
              onClick={() => setActiveJob(job)}
              style={{
                background: '#fff',
                borderRadius: '8px',
                padding: '16px',
                boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
                cursor: 'pointer',
                borderLeft: `4px solid ${STATUS_COLORS[job.status] || '#999'}`,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontWeight: 600, fontSize: '15px' }}>{job.title}</span>
                <span style={{
                  fontSize: '11px',
                  padding: '2px 8px',
                  borderRadius: '10px',
                  background: STATUS_COLORS[job.status] || '#999',
                  color: '#fff',
                }}>
                  {job.status.replace(/_/g, ' ')}
                </span>
              </div>
              <div style={{ fontSize: '13px', color: '#666' }}>{job.customer?.name || 'No customer'}</div>
              <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>{job.address}</div>
              {job.scheduledAt && (
                <div style={{ fontSize: '12px', color: '#1976d2', marginTop: '4px' }}>{new Date(job.scheduledAt).toLocaleString()}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
