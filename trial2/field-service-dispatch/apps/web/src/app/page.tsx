'use client';

import { useEffect } from 'react';
import { isAuthenticated } from '@/lib/auth';

export default function Home() {
  useEffect(() => {
    if (isAuthenticated()) {
      window.location.href = '/dispatch';
    }
  }, []);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' }}>
      <div style={{ textAlign: 'center', maxWidth: '600px', padding: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '8px' }}>Field Service Dispatch</h1>
        <p style={{ color: '#666', fontSize: '16px', marginBottom: '32px' }}>
          Multi-tenant field service management platform for dispatching technicians, tracking jobs, and managing invoices.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="/login" style={{ padding: '12px 24px', background: '#1976d2', color: '#fff', textDecoration: 'none', borderRadius: '6px', fontWeight: 600 }}>
            Sign In
          </a>
          <a href="/tracking" style={{ padding: '12px 24px', background: '#fff', color: '#1976d2', textDecoration: 'none', borderRadius: '6px', fontWeight: 600, border: '1px solid #1976d2' }}>
            Track a Service
          </a>
        </div>
        <div style={{ marginTop: '48px', display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="/dispatch" style={{ color: '#666', fontSize: '13px' }}>Dispatch</a>
          <a href="/work-orders" style={{ color: '#666', fontSize: '13px' }}>Work Orders</a>
          <a href="/technicians" style={{ color: '#666', fontSize: '13px' }}>Technicians</a>
          <a href="/customers" style={{ color: '#666', fontSize: '13px' }}>Customers</a>
          <a href="/admin" style={{ color: '#666', fontSize: '13px' }}>Admin</a>
          <a href="/mobile" style={{ color: '#666', fontSize: '13px' }}>Mobile</a>
        </div>
      </div>
    </div>
  );
}
