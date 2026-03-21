'use client';

import { useState } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth-context';
import { apiClient } from '@/lib/api-client';
import { formatDate } from '@/lib/utils';
import { TIER_LIMITS } from '@analytics-engine/shared';
import type { SubscriptionTier } from '@analytics-engine/shared';

export default function TenantSettingsPage() {
  const { tenant, refreshTenant } = useAuth();
  const [name, setName] = useState(tenant?.name ?? '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  if (!tenant) return null;

  const limits = TIER_LIMITS[tenant.tier as SubscriptionTier];

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await apiClient.patch('/tenant/me', { name });
      await refreshTenant();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      // error
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Account Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your organization settings and subscription.
        </p>
      </div>

      <div className="max-w-2xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Organization</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Organization Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={tenant.email} disabled />
              <p className="text-xs text-gray-500">
                {tenant.emailVerified ? 'Verified' : 'Not verified'}
              </p>
            </div>
            <div className="space-y-2">
              <Label>Region</Label>
              <Input value={tenant.region} disabled />
            </div>
            <div className="space-y-2">
              <Label>Member Since</Label>
              <Input value={formatDate(tenant.createdAt)} disabled />
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save'}
              </Button>
              {saved && <span className="text-sm text-emerald-600">Saved!</span>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subscription</CardTitle>
            <CardDescription>Your current plan and usage limits.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex items-center gap-2">
              <Badge variant={tenant.tier === 'FREE' ? 'default' : tenant.tier === 'PRO' ? 'info' : 'success'}>
                {tenant.tier}
              </Badge>
              <span className="text-sm text-gray-500">plan</span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Max Data Sources</p>
                <p className="font-medium">
                  {limits.maxDataSources === Infinity ? 'Unlimited' : limits.maxDataSources}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Max Dashboards</p>
                <p className="font-medium">
                  {limits.maxDashboards === Infinity ? 'Unlimited' : limits.maxDashboards}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Widgets per Dashboard</p>
                <p className="font-medium">{limits.maxWidgetsPerDashboard}</p>
              </div>
              <div>
                <p className="text-gray-500">Data Retention</p>
                <p className="font-medium">
                  {limits.maxDataPointRetentionDays === Infinity
                    ? 'Unlimited'
                    : `${limits.maxDataPointRetentionDays} days`}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Cache TTL</p>
                <p className="font-medium">{limits.cacheTtlSeconds}s</p>
              </div>
              <div>
                <p className="text-gray-500">Sync Schedules</p>
                <p className="font-medium">
                  {limits.allowedSyncSchedules.map((s) => s.replace(/_/g, ' ')).join(', ')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Danger Zone</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-3 text-sm text-gray-500">
              Request account deletion. This will permanently remove all your data,
              dashboards, and data sources.
            </p>
            <Button variant="destructive">Request Account Deletion</Button>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
