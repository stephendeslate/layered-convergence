'use client';

import { useState, useEffect, useCallback, FormEvent } from 'react';
import { apiFetch } from '@/lib/api';

interface CompanyProfile {
  id: string;
  name: string;
  slug: string;
  settings: Record<string, unknown>;
  createdAt: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

interface Technician {
  id: string;
  skills: string[];
  status: string;
  user: { name: string; email: string };
}

type ActiveTab = 'company' | 'technicians' | 'users';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('company');
  const [company, setCompany] = useState<CompanyProfile | null>(null);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(true);

  const [showTechForm, setShowTechForm] = useState(false);
  const [techForm, setTechForm] = useState({ name: '', email: '', password: '', skills: '' });
  const [techFormError, setTechFormError] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const [me, techs] = await Promise.all([
        apiFetch<{ company: CompanyProfile }>('/auth/me'),
        apiFetch<Technician[]>('/technicians'),
      ]);
      setCompany(me.company);
      setTechnicians(techs);
    } catch (err) {
      console.error('Failed to fetch admin data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreateTechnician = async (e: FormEvent) => {
    e.preventDefault();
    setTechFormError('');
    try {
      await apiFetch('/technicians', {
        method: 'POST',
        body: JSON.stringify({
          name: techForm.name,
          email: techForm.email,
          password: techForm.password,
          skills: techForm.skills.split(',').map(s => s.trim()).filter(Boolean),
        }),
      });
      setShowTechForm(false);
      setTechForm({ name: '', email: '', password: '', skills: '' });
      await fetchData();
    } catch (err) {
      setTechFormError(err instanceof Error ? err.message : 'Failed to create technician');
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading admin panel...</div>;
  }

  const tabStyle = (tab: ActiveTab) => ({
    padding: '10px 20px',
    border: 'none',
    borderBottom: activeTab === tab ? '3px solid #1976d2' : '3px solid transparent',
    background: 'none',
    cursor: 'pointer',
    fontWeight: activeTab === tab ? 700 : 400,
    fontSize: '14px',
    color: activeTab === tab ? '#1976d2' : '#666',
  });

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '24px' }}>
      <h1 style={{ fontSize: '24px', marginBottom: '24px' }}>Admin Panel</h1>

      <div style={{ borderBottom: '1px solid #e0e0e0', marginBottom: '24px' }}>
        <button style={tabStyle('company')} onClick={() => setActiveTab('company')}>Company</button>
        <button style={tabStyle('technicians')} onClick={() => setActiveTab('technicians')}>Technicians</button>
      </div>

      {activeTab === 'company' && company && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ padding: '20px', background: '#f5f5f5', borderRadius: '8px' }}>
              <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px', textTransform: 'uppercase' }}>Company Name</div>
              <div style={{ fontSize: '18px', fontWeight: 600 }}>{company.name}</div>
            </div>
            <div style={{ padding: '20px', background: '#f5f5f5', borderRadius: '8px' }}>
              <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px', textTransform: 'uppercase' }}>Slug</div>
              <div style={{ fontSize: '18px', fontWeight: 600 }}>{company.slug}</div>
            </div>
            <div style={{ padding: '20px', background: '#f5f5f5', borderRadius: '8px' }}>
              <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px', textTransform: 'uppercase' }}>Created</div>
              <div style={{ fontSize: '18px', fontWeight: 600 }}>{new Date(company.createdAt).toLocaleDateString()}</div>
            </div>
            <div style={{ padding: '20px', background: '#f5f5f5', borderRadius: '8px' }}>
              <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px', textTransform: 'uppercase' }}>Technicians</div>
              <div style={{ fontSize: '18px', fontWeight: 600 }}>{technicians.length}</div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'technicians' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0 }}>Technicians ({technicians.length})</h3>
            <button
              onClick={() => setShowTechForm(!showTechForm)}
              style={{ padding: '8px 16px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}
            >
              {showTechForm ? 'Cancel' : 'Add Technician'}
            </button>
          </div>

          {showTechForm && (
            <div style={{ padding: '20px', background: '#f5f5f5', borderRadius: '8px', marginBottom: '16px' }}>
              {techFormError && <div style={{ padding: '8px 12px', background: '#ffebee', color: '#c62828', borderRadius: '4px', marginBottom: '12px', fontSize: '13px' }}>{techFormError}</div>}
              <form onSubmit={handleCreateTechnician} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <input placeholder="Name" required value={techForm.name} onChange={e => setTechForm(f => ({ ...f, name: e.target.value }))} style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }} />
                <input placeholder="Email" type="email" required value={techForm.email} onChange={e => setTechForm(f => ({ ...f, email: e.target.value }))} style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }} />
                <input placeholder="Password" type="password" required value={techForm.password} onChange={e => setTechForm(f => ({ ...f, password: e.target.value }))} style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }} />
                <input placeholder="Skills (comma-separated)" value={techForm.skills} onChange={e => setTechForm(f => ({ ...f, skills: e.target.value }))} style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }} />
                <button type="submit" style={{ gridColumn: '1 / -1', padding: '10px', background: '#66bb6a', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}>Create Technician</button>
              </form>
            </div>
          )}

          <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <thead>
              <tr style={{ background: '#f5f5f5', textAlign: 'left' }}>
                <th style={{ padding: '12px 16px', fontSize: '13px' }}>Name</th>
                <th style={{ padding: '12px 16px', fontSize: '13px' }}>Email</th>
                <th style={{ padding: '12px 16px', fontSize: '13px' }}>Status</th>
                <th style={{ padding: '12px 16px', fontSize: '13px' }}>Skills</th>
              </tr>
            </thead>
            <tbody>
              {technicians.map(tech => (
                <tr key={tech.id} style={{ borderTop: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 600 }}>{tech.user.name}</td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', color: '#666' }}>{tech.user.email}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      fontSize: '11px',
                      padding: '2px 8px',
                      borderRadius: '10px',
                      background: tech.status === 'AVAILABLE' ? '#66bb6a' : tech.status === 'BUSY' ? '#ffa726' : '#9e9e9e',
                      color: '#fff',
                    }}>
                      {tech.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      {tech.skills.map(skill => (
                        <span key={skill} style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '8px', background: '#e3f2fd', color: '#1565c0' }}>{skill}</span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
