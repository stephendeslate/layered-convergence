'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';
import { Priority, ServiceType } from '@fsd/shared';
import type { WorkOrderDto, TechnicianDto } from '@fsd/shared';
import { serviceTypeLabel } from '@/lib/utils';

export default function EditWorkOrderPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [technicians, setTechnicians] = useState<TechnicianDto[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    technicianId: '',
    serviceType: ServiceType.GENERAL_MAINTENANCE as string,
    priority: Priority.NORMAL as string,
    description: '',
    notes: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    latitude: '',
    longitude: '',
    scheduledStart: '',
    scheduledEnd: '',
    estimatedMinutes: '60',
  });

  useEffect(() => {
    Promise.all([
      api.get<WorkOrderDto>(`/work-orders/${id}`),
      api.get<TechnicianDto[]>('/technicians').catch(() => []),
    ]).then(([wo, techs]) => {
      setTechnicians(Array.isArray(techs) ? techs : (techs as any).data || []);
      setForm({
        technicianId: wo.technicianId || '',
        serviceType: wo.serviceType,
        priority: wo.priority,
        description: wo.description || '',
        notes: wo.notes || '',
        address: wo.address,
        city: wo.city,
        state: wo.state,
        zipCode: wo.zipCode,
        latitude: String(wo.latitude),
        longitude: String(wo.longitude),
        scheduledStart: wo.scheduledStart.slice(0, 16),
        scheduledEnd: wo.scheduledEnd.slice(0, 16),
        estimatedMinutes: String(wo.estimatedMinutes),
      });
      setIsLoading(false);
    }).catch(() => {
      setError('Failed to load work order');
      setIsLoading(false);
    });
  }, [id]);

  const handleChange = (field: string) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    try {
      await api.patch(`/work-orders/${id}`, {
        technicianId: form.technicianId || null,
        serviceType: form.serviceType,
        priority: form.priority,
        description: form.description || null,
        notes: form.notes || null,
        address: form.address,
        city: form.city,
        state: form.state,
        zipCode: form.zipCode,
        latitude: parseFloat(form.latitude),
        longitude: parseFloat(form.longitude),
        scheduledStart: new Date(form.scheduledStart).toISOString(),
        scheduledEnd: new Date(form.scheduledEnd).toISOString(),
        estimatedMinutes: parseInt(form.estimatedMinutes),
      });
      router.push(`/work-orders/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update work order');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-4 max-w-3xl mx-auto">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="h-64 bg-gray-200 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 max-w-3xl mx-auto">
      <Link href={`/work-orders/${id}`} className="text-sm text-blue-600 hover:underline flex items-center gap-1 mb-4">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Back to Work Order
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Work Order</h1>

      {error && (
        <div className="mb-4 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Service Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Technician</Label>
                <Select value={form.technicianId} onChange={handleChange('technicianId')}>
                  <option value="">Unassigned</option>
                  {technicians.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.user.firstName} {t.user.lastName}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Service Type</Label>
                <Select value={form.serviceType} onChange={handleChange('serviceType')} required>
                  {Object.values(ServiceType).map((st) => (
                    <option key={st} value={st}>{serviceTypeLabel(st)}</option>
                  ))}
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={form.priority} onChange={handleChange('priority')} required className="max-w-xs">
                {Object.values(Priority).map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={handleChange('description')} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Location</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Address</Label>
              <Input value={form.address} onChange={handleChange('address')} required />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label>City</Label>
                <Input value={form.city} onChange={handleChange('city')} required />
              </div>
              <div className="space-y-2">
                <Label>State</Label>
                <Input value={form.state} onChange={handleChange('state')} required />
              </div>
              <div className="space-y-2">
                <Label>ZIP</Label>
                <Input value={form.zipCode} onChange={handleChange('zipCode')} required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Latitude</Label>
                <Input type="number" step="0.0000001" value={form.latitude} onChange={handleChange('latitude')} required />
              </div>
              <div className="space-y-2">
                <Label>Longitude</Label>
                <Input type="number" step="0.0000001" value={form.longitude} onChange={handleChange('longitude')} required />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Schedule</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Scheduled Start</Label>
                <Input type="datetime-local" value={form.scheduledStart} onChange={handleChange('scheduledStart')} required />
              </div>
              <div className="space-y-2">
                <Label>Scheduled End</Label>
                <Input type="datetime-local" value={form.scheduledEnd} onChange={handleChange('scheduledEnd')} required />
              </div>
            </div>
            <div className="space-y-2 max-w-xs">
              <Label>Estimated Duration (minutes)</Label>
              <Input type="number" value={form.estimatedMinutes} onChange={handleChange('estimatedMinutes')} min={15} step={15} required />
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea value={form.notes} onChange={handleChange('notes')} />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3 justify-end">
          <Button variant="outline" type="button" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
}
