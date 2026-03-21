'use client';

import { useState } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/lib/auth-context';
import { apiClient } from '@/lib/api-client';

export default function ThemeSettingsPage() {
  const { tenant, refreshTenant } = useAuth();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [primaryColor, setPrimaryColor] = useState(tenant?.primaryColor ?? '#3b82f6');
  const [secondaryColor, setSecondaryColor] = useState(tenant?.secondaryColor ?? '#10b981');
  const [backgroundColor, setBackgroundColor] = useState(tenant?.backgroundColor ?? '#ffffff');
  const [textColor, setTextColor] = useState(tenant?.textColor ?? '#111827');
  const [fontFamily, setFontFamily] = useState(tenant?.fontFamily ?? 'Inter, system-ui, sans-serif');
  const [cornerRadius, setCornerRadius] = useState(tenant?.cornerRadius ?? 8);
  const [logoUrl, setLogoUrl] = useState(tenant?.logoUrl ?? '');

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await apiClient.patch('/tenant/theme', {
        primaryColor,
        secondaryColor,
        backgroundColor,
        textColor,
        fontFamily,
        cornerRadius,
        logoUrl: logoUrl || null,
      });
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
        <h1 className="text-2xl font-semibold text-gray-900">Theme & Branding</h1>
        <p className="mt-1 text-sm text-gray-500">
          Customize the look and feel of your embedded dashboards.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Colors</CardTitle>
              <CardDescription>Set the brand colors for your embedded dashboards.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Primary Color</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="h-9 w-9 cursor-pointer rounded border border-gray-200"
                    />
                    <Input
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="font-mono text-xs"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Secondary Color</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="h-9 w-9 cursor-pointer rounded border border-gray-200"
                    />
                    <Input
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="font-mono text-xs"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Background Color</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      className="h-9 w-9 cursor-pointer rounded border border-gray-200"
                    />
                    <Input
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      className="font-mono text-xs"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Text Color</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="h-9 w-9 cursor-pointer rounded border border-gray-200"
                    />
                    <Input
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="font-mono text-xs"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Typography & Shape</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Font Family</Label>
                <Input
                  value={fontFamily}
                  onChange={(e) => setFontFamily(e.target.value)}
                  placeholder="Inter, system-ui, sans-serif"
                />
              </div>
              <div className="space-y-2">
                <Label>Corner Radius (px)</Label>
                <Input
                  type="number"
                  min={0}
                  max={32}
                  value={cornerRadius}
                  onChange={(e) => setCornerRadius(+e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Logo URL (optional)</Label>
                <Input
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="https://example.com/logo.svg"
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center gap-3">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save Theme'}
            </Button>
            {saved && (
              <span className="text-sm text-emerald-600">Theme saved successfully!</span>
            )}
          </div>
        </div>

        {/* Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
            <CardDescription>How your embedded dashboard will look.</CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className="overflow-hidden rounded-lg border"
              style={{
                backgroundColor,
                color: textColor,
                fontFamily,
                borderRadius: `${cornerRadius}px`,
              }}
            >
              <div className="border-b p-4" style={{ borderColor: primaryColor + '30' }}>
                <div className="flex items-center gap-2">
                  {logoUrl && (
                    <img src={logoUrl} alt="Logo" className="h-6 w-6 object-contain" />
                  )}
                  <span className="text-sm font-semibold">Dashboard Preview</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 p-4">
                <div
                  className="rounded-md p-3"
                  style={{
                    backgroundColor: primaryColor + '10',
                    borderRadius: `${cornerRadius}px`,
                  }}
                >
                  <p className="text-xs opacity-60">Total Users</p>
                  <p className="mt-1 text-xl font-bold" style={{ color: primaryColor }}>
                    12,450
                  </p>
                </div>
                <div
                  className="rounded-md p-3"
                  style={{
                    backgroundColor: secondaryColor + '10',
                    borderRadius: `${cornerRadius}px`,
                  }}
                >
                  <p className="text-xs opacity-60">Revenue</p>
                  <p className="mt-1 text-xl font-bold" style={{ color: secondaryColor }}>
                    $84.2K
                  </p>
                </div>
                <div className="col-span-2 h-24 rounded-md" style={{
                  background: `linear-gradient(135deg, ${primaryColor}20, ${secondaryColor}20)`,
                  borderRadius: `${cornerRadius}px`,
                }}>
                  <div className="flex h-full items-center justify-center text-xs opacity-40">
                    Chart area
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
