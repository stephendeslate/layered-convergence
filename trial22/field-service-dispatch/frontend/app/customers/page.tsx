'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Table } from '@/components/ui/table';

interface Customer {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');

  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

  function loadCustomers() {
    if (!token) return;
    fetch(`${API_URL}/api/customers`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => { if (res.ok) return res.json(); throw new Error('Failed'); })
      .then(setCustomers)
      .catch(() => setCustomers([]));
  }

  useEffect(() => {
    if (!token) { window.location.href = '/login'; return; }
    loadCustomers();
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const response = await fetch(`${API_URL}/api/customers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name, email: email || undefined, phone: phone || undefined, address }),
    });
    if (response.ok) {
      setName(''); setEmail(''); setPhone(''); setAddress('');
      loadCustomers();
    } else {
      const data = await response.json();
      setError(Array.isArray(data.message) ? data.message.join(', ') : data.message);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Customers</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Table>
            <thead>
              <tr>
                <th className="text-left p-2">Name</th>
                <th className="text-left p-2">Email</th>
                <th className="text-left p-2">Phone</th>
                <th className="text-left p-2">Address</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id} className="border-t border-[var(--border)]">
                  <td className="p-2">{c.name}</td>
                  <td className="p-2">{c.email ?? '---'}</td>
                  <td className="p-2">{c.phone ?? '---'}</td>
                  <td className="p-2">{c.address}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
        <Card className="p-4 bg-[var(--card)] border border-[var(--border)] rounded-lg">
          <h2 className="text-lg font-semibold mb-4">New Customer</h2>
          {error && <div role="alert" className="mb-3 p-2 bg-red-100 text-red-700 rounded text-sm">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div><Label htmlFor="cust-name">Name</Label><Input id="cust-name" value={name} onChange={(e) => setName(e.target.value)} required /></div>
            <div><Label htmlFor="cust-email">Email</Label><Input id="cust-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
            <div><Label htmlFor="cust-phone">Phone</Label><Input id="cust-phone" value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
            <div><Label htmlFor="cust-address">Address</Label><Input id="cust-address" value={address} onChange={(e) => setAddress(e.target.value)} required /></div>
            <Button type="submit" className="w-full">Add Customer</Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
