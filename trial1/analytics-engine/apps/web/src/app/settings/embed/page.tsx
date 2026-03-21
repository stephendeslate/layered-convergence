'use client';

import { useEffect, useState } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { PageLoader } from '@/components/ui/spinner';
import { apiClient } from '@/lib/api-client';
import type { Dashboard, EmbedConfig } from '@analytics-engine/shared';

interface DashboardWithEmbed extends Dashboard {
  embedConfig: EmbedConfig | null;
}

export default function EmbedSettingsPage() {
  const [dashboards, setDashboards] = useState<DashboardWithEmbed[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [origins, setOrigins] = useState<string[]>([]);
  const [newOrigin, setNewOrigin] = useState('');
  const [enabled, setEnabled] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    apiClient
      .get<DashboardWithEmbed[]>('/dashboards?include=embedConfig')
      .then((res) => {
        setDashboards(res.data);
        if (res.data.length > 0) {
          const first = res.data[0];
          setSelectedId(first.id);
          setOrigins(first.embedConfig?.allowedOrigins ?? []);
          setEnabled(first.embedConfig?.isEnabled ?? false);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const selected = dashboards.find((d) => d.id === selectedId);

  const handleDashboardChange = (id: string) => {
    setSelectedId(id);
    const d = dashboards.find((x) => x.id === id);
    setOrigins(d?.embedConfig?.allowedOrigins ?? []);
    setEnabled(d?.embedConfig?.isEnabled ?? false);
  };

  const addOrigin = () => {
    if (newOrigin && !origins.includes(newOrigin)) {
      setOrigins([...origins, newOrigin]);
      setNewOrigin('');
    }
  };

  const removeOrigin = (origin: string) => {
    setOrigins(origins.filter((o) => o !== origin));
  };

  const handleSave = async () => {
    if (!selectedId) return;
    setSaving(true);
    try {
      await apiClient.put(`/dashboards/${selectedId}/embed-config`, {
        allowedOrigins: origins,
        isEnabled: enabled,
      });
      // Refresh
      const res = await apiClient.get<DashboardWithEmbed[]>('/dashboards?include=embedConfig');
      setDashboards(res.data);
    } catch {
      // error
    } finally {
      setSaving(false);
    }
  };

  const embedCode = selectedId
    ? `<iframe
  src="${typeof window !== 'undefined' ? window.location.origin.replace(':3000', ':3002') : 'http://localhost:3002'}/d/${selectedId}"
  width="100%"
  height="600"
  frameborder="0"
  style="border: none; border-radius: 8px;"
></iframe>`
    : '';

  const handleCopy = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Embed Configuration</h1>
        <p className="mt-1 text-sm text-gray-500">
          Generate embed code and manage allowed origins for your dashboards.
        </p>
      </div>

      {loading ? (
        <PageLoader />
      ) : dashboards.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-sm text-gray-500">
              Create a dashboard first, then configure embedding here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Dashboard</CardTitle>
                <CardDescription>Select the dashboard to configure for embedding.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dashboards.map((d) => (
                    <button
                      key={d.id}
                      onClick={() => handleDashboardChange(d.id)}
                      className={`flex w-full items-center justify-between rounded-md border-2 p-3 text-left transition-colors ${
                        selectedId === d.id
                          ? 'border-gray-900 bg-gray-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div>
                        <p className="text-sm font-medium">{d.name}</p>
                        <p className="text-xs text-gray-500">{d.status}</p>
                      </div>
                      {d.embedConfig?.isEnabled && (
                        <Badge variant="success">Embed Active</Badge>
                      )}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Allowed Origins</CardTitle>
                <CardDescription>
                  Only these origins can embed this dashboard. Use exact URLs (e.g., https://app.example.com).
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      value={newOrigin}
                      onChange={(e) => setNewOrigin(e.target.value)}
                      placeholder="https://app.example.com"
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addOrigin())}
                    />
                    <Button variant="outline" onClick={addOrigin} disabled={!newOrigin}>
                      Add
                    </Button>
                  </div>
                  {origins.length === 0 ? (
                    <p className="text-xs text-gray-500">No origins configured yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {origins.map((origin) => (
                        <div
                          key={origin}
                          className="flex items-center justify-between rounded-md bg-gray-50 px-3 py-2"
                        >
                          <span className="font-mono text-xs text-gray-700">{origin}</span>
                          <button
                            onClick={() => removeOrigin(origin)}
                            className="text-xs text-red-500 hover:text-red-700"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Enable Embedding</p>
                    <p className="text-xs text-gray-500">
                      Dashboard must be PUBLISHED to be embeddable.
                    </p>
                  </div>
                  <button
                    onClick={() => setEnabled(!enabled)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                      enabled ? 'bg-gray-900' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${
                        enabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </CardContent>
            </Card>

            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save Embed Config'}
            </Button>
          </div>

          {/* Embed code preview */}
          <Card>
            <CardHeader>
              <CardTitle>Embed Code</CardTitle>
              <CardDescription>
                Copy this code and paste it into your website to embed the dashboard.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="relative">
                  <pre className="overflow-auto rounded-md bg-gray-900 p-4 text-xs text-gray-100">
                    <code>{embedCode}</code>
                  </pre>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="absolute right-2 top-2"
                    onClick={handleCopy}
                  >
                    {copied ? 'Copied!' : 'Copy'}
                  </Button>
                </div>

                {selected?.status !== 'PUBLISHED' && (
                  <div className="rounded-md bg-amber-50 p-3 text-xs text-amber-700">
                    This dashboard must be published before it can be embedded.
                  </div>
                )}

                <div className="rounded-md border border-gray-200 p-4">
                  <p className="mb-2 text-xs font-medium text-gray-500">Preview</p>
                  <div className="flex h-48 items-center justify-center rounded-md bg-gray-50 text-sm text-gray-400">
                    Embed preview would render here
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </AppShell>
  );
}
