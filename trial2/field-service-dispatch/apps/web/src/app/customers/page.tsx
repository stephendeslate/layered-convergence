'use client';

import { useState, useEffect, useCallback, FormEvent } from 'react';
import { apiFetch } from '@/lib/api';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  address: string;
  lat: number;
  lng: number;
  createdAt: string;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', address: '', lat: '30.2672', lng: '-97.7431' });
  const [formError, setFormError] = useState('');

  const fetchCustomers = useCallback(async () => {
    try {
      const data = await apiFetch<Customer[]>('/customers');
      setCustomers(data);
    } catch (err) {
      console.error('Failed to fetch customers:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    setFormError('');
    try {
      await apiFetch('/customers', {
        method: 'POST',
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone || undefined,
          address: formData.address,
          lat: parseFloat(formData.lat),
          lng: parseFloat(formData.lng),
        }),
      });
      setShowForm(false);
      setFormData({ name: '', email: '', phone: '', address: '', lat: '30.2672', lng: '-97.7431' });
      await fetchCustomers();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to create customer');
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading customers...</div>;
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ margin: 0, fontSize: '24px' }}>Customers ({customers.length})</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{ padding: '10px 20px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}
        >
          {showForm ? 'Cancel' : 'Add Customer'}
        </button>
      </div>

      {showForm && (
        <div style={{ padding: '20px', background: '#f5f5f5', borderRadius: '8px', marginBottom: '24px' }}>
          <h3 style={{ margin: '0 0 16px 0' }}>New Customer</h3>
          {formError && <div style={{ padding: '8px 12px', background: '#ffebee', color: '#c62828', borderRadius: '4px', marginBottom: '12px', fontSize: '13px' }}>{formError}</div>}
          <form onSubmit={handleCreate} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <input placeholder="Name" required value={formData.name} onChange={e => setFormData(f => ({ ...f, name: e.target.value }))} style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }} />
            <input placeholder="Email" type="email" required value={formData.email} onChange={e => setFormData(f => ({ ...f, email: e.target.value }))} style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }} />
            <input placeholder="Phone" value={formData.phone} onChange={e => setFormData(f => ({ ...f, phone: e.target.value }))} style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }} />
            <input placeholder="Address" required value={formData.address} onChange={e => setFormData(f => ({ ...f, address: e.target.value }))} style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }} />
            <input placeholder="Latitude" type="number" step="any" required value={formData.lat} onChange={e => setFormData(f => ({ ...f, lat: e.target.value }))} style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }} />
            <input placeholder="Longitude" type="number" step="any" required value={formData.lng} onChange={e => setFormData(f => ({ ...f, lng: e.target.value }))} style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }} />
            <button type="submit" style={{ gridColumn: '1 / -1', padding: '10px', background: '#66bb6a', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}>Create Customer</button>
          </form>
        </div>
      )}

      <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <thead>
          <tr style={{ background: '#f5f5f5', textAlign: 'left' }}>
            <th style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600 }}>Name</th>
            <th style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600 }}>Email</th>
            <th style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600 }}>Phone</th>
            <th style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600 }}>Address</th>
            <th style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600 }}>Created</th>
          </tr>
        </thead>
        <tbody>
          {customers.map(c => (
            <tr key={c.id} style={{ borderTop: '1px solid #f0f0f0' }}>
              <td style={{ padding: '12px 16px', fontWeight: 600, fontSize: '14px' }}>{c.name}</td>
              <td style={{ padding: '12px 16px', fontSize: '13px', color: '#666' }}>{c.email}</td>
              <td style={{ padding: '12px 16px', fontSize: '13px', color: '#666' }}>{c.phone || '-'}</td>
              <td style={{ padding: '12px 16px', fontSize: '13px', color: '#666' }}>{c.address}</td>
              <td style={{ padding: '12px 16px', fontSize: '13px', color: '#999' }}>{new Date(c.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
