'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import { ServiceType } from '@fsd/shared';
import { serviceTypeLabel } from '@/lib/utils';
import type { CompanyDto } from '@fsd/shared';

export default function SettingsPage() {
  const [company, setCompany] = useState<CompanyDto | null>(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    website: '',
    taxRate: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.get<CompanyDto>('/companies/me')
      .then((c) => {
        setCompany(c);
        setForm({
          name: c.name,
          email: c.email,
          phone: c.phone || '',
          website: c.website || '',
          taxRate: String(c.taxRate),
        });
      })
      .catch(() => {});
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setSaved(false);
    try {
      await api.patch('/companies/me', {
        name: form.name,
        email: form.email,
        phone: form.phone || null,
        website: form.website || null,
        taxRate: parseFloat(form.taxRate),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      alert('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-4 lg:p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>

      <Tabs defaultValue="company">
        <TabsList>
          <TabsTrigger value="company">Company</TabsTrigger>
          <TabsTrigger value="services">Service Types</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="company" className="space-y-6 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Company Profile</CardTitle>
              <CardDescription>Update your company information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Company Name</Label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input
                    value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Website</Label>
                  <Input
                    value={form.website}
                    onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-2 max-w-xs">
                <Label>Default Tax Rate (%)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={form.taxRate}
                  onChange={(e) => setForm((f) => ({ ...f, taxRate: e.target.value }))}
                />
              </div>

              <div className="flex items-center gap-3">
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
                {saved && (
                  <span className="text-sm text-green-600 font-medium">Changes saved</span>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Branding</CardTitle>
              <CardDescription>Customize your customer-facing appearance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Logo</Label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center text-gray-400 text-xs">
                    {company?.logoUrl ? (
                      <img src={company.logoUrl} alt="Logo" className="w-full h-full object-contain rounded-lg" />
                    ) : (
                      'No logo'
                    )}
                  </div>
                  <Button variant="outline" size="sm">Upload Logo</Button>
                </div>
              </div>
              <div className="space-y-2 max-w-xs">
                <Label>Primary Color</Label>
                <div className="flex items-center gap-2">
                  <input type="color" defaultValue="#3B82F6" className="w-10 h-10 rounded border border-gray-300 cursor-pointer" />
                  <Input defaultValue="#3B82F6" className="max-w-[120px]" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Service Types</CardTitle>
              <CardDescription>Manage the types of services your company offers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.values(ServiceType).map((st) => (
                  <div
                    key={st}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary">{serviceTypeLabel(st)}</Badge>
                    </div>
                    <span className="text-xs text-gray-400">{st}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Configure when and how notifications are sent</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: 'Work order created', desc: 'Notify admin when new work orders are created' },
                { label: 'Technician dispatched', desc: 'Notify customer when technician is dispatched' },
                { label: 'Technician en route', desc: 'Notify customer when technician starts driving' },
                { label: 'Arriving soon (15 min)', desc: 'Notify customer 15 minutes before arrival' },
                { label: 'Arriving soon (5 min)', desc: 'Notify customer 5 minutes before arrival' },
                { label: 'Job completed', desc: 'Notify customer when job is finished' },
                { label: 'Invoice sent', desc: 'Notify customer when invoice is sent' },
              ].map((notif) => (
                <div key={notif.label} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div>
                    <div className="text-sm font-medium">{notif.label}</div>
                    <div className="text-xs text-gray-500">{notif.desc}</div>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="default" className="cursor-pointer">Email</Badge>
                    <Badge variant="outline" className="cursor-pointer">SMS</Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
