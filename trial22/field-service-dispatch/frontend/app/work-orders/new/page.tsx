'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Select } from '@/components/ui/select';

interface Customer {
  id: string;
  name: string;
}

const PRIORITY_OPTIONS = [
  { label: 'Low', value: 'LOW' },
  { label: 'Medium', value: 'MEDIUM' },
  { label: 'High', value: 'HIGH' },
  { label: 'Urgent', value: 'URGENT' },
];

export default function NewWorkOrderPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [customerId, setCustomerId] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      window.location.href = '/login';
      return;
    }

    fetch(`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000'}/api/customers`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error('Failed to fetch customers');
      })
      .then(setCustomers)
      .catch(() => setCustomers([]));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    const token = localStorage.getItem('accessToken');
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000'}/api/work-orders`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          description: description || undefined,
          priority,
          customerId,
          scheduledDate: scheduledDate || undefined,
        }),
      },
    );

    if (response.ok) {
      const data = await response.json();
      window.location.href = `/work-orders/${data.id}`;
    } else {
      const data = await response.json();
      setError(Array.isArray(data.message) ? data.message.join(', ') : data.message);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">New Work Order</h1>
      <Card className="max-w-2xl p-6 bg-[var(--card)] border border-[var(--border)] rounded-lg">
        {error && (
          <div role="alert" className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="priority">Priority</Label>
            <Select
              value={priority}
              onChange={setPriority}
              options={PRIORITY_OPTIONS}
              aria-label="Select priority"
            />
          </div>
          <div>
            <Label htmlFor="customer">Customer</Label>
            <Select
              value={customerId}
              onChange={setCustomerId}
              options={customers.map((c) => ({ label: c.name, value: c.id }))}
              aria-label="Select customer"
            />
          </div>
          <div>
            <Label htmlFor="scheduledDate">Scheduled Date</Label>
            <Input
              id="scheduledDate"
              type="date"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
            />
          </div>
          <Button type="submit">Create Work Order</Button>
        </form>
      </Card>
    </div>
  );
}
