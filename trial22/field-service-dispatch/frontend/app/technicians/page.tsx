'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Table } from '@/components/ui/table';

interface Technician {
  id: string;
  name: string;
  phone: string | null;
  specialties: string | null;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

export default function TechniciansPage() {
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [specialties, setSpecialties] = useState('');
  const [error, setError] = useState('');

  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

  function loadTechnicians() {
    if (!token) return;
    fetch(`${API_URL}/api/technicians`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => { if (res.ok) return res.json(); throw new Error('Failed'); })
      .then(setTechnicians)
      .catch(() => setTechnicians([]));
  }

  useEffect(() => {
    if (!token) { window.location.href = '/login'; return; }
    loadTechnicians();
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const response = await fetch(`${API_URL}/api/technicians`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name, phone: phone || undefined, specialties: specialties || undefined }),
    });
    if (response.ok) {
      setName(''); setPhone(''); setSpecialties('');
      loadTechnicians();
    } else {
      const data = await response.json();
      setError(Array.isArray(data.message) ? data.message.join(', ') : data.message);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Technicians</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Table>
            <thead>
              <tr>
                <th className="text-left p-2">Name</th>
                <th className="text-left p-2">Phone</th>
                <th className="text-left p-2">Specialties</th>
              </tr>
            </thead>
            <tbody>
              {technicians.map((t) => (
                <tr key={t.id} className="border-t border-[var(--border)]">
                  <td className="p-2">{t.name}</td>
                  <td className="p-2">{t.phone ?? '---'}</td>
                  <td className="p-2">{t.specialties ?? '---'}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
        <Card className="p-4 bg-[var(--card)] border border-[var(--border)] rounded-lg">
          <h2 className="text-lg font-semibold mb-4">New Technician</h2>
          {error && <div role="alert" className="mb-3 p-2 bg-red-100 text-red-700 rounded text-sm">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div><Label htmlFor="tech-name">Name</Label><Input id="tech-name" value={name} onChange={(e) => setName(e.target.value)} required /></div>
            <div><Label htmlFor="tech-phone">Phone</Label><Input id="tech-phone" value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
            <div><Label htmlFor="tech-specialties">Specialties</Label><Input id="tech-specialties" value={specialties} onChange={(e) => setSpecialties(e.target.value)} /></div>
            <Button type="submit" className="w-full">Add Technician</Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
