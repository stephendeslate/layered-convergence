'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { applyTheme, resetTheme } from '@/lib/theme';

interface BrandingConfig {
  primaryColor: string;
  fontFamily: string;
  backgroundColor: string;
  textColor: string;
}

const DEFAULT_BRANDING: BrandingConfig = {
  primaryColor: '#3b82f6',
  fontFamily: 'Inter, sans-serif',
  backgroundColor: '#ffffff',
  textColor: '#1e293b',
};

export default function AdminPage() {
  const { token, logout, isAuthenticated } = useAuth();
  const [branding, setBranding] = useState<BrandingConfig>(DEFAULT_BRANDING);
  const [slug, setSlug] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    try {
      const { api } = await import('@/lib/api');
      const result = await api.auth.login(slug, apiKey);
      login(result.accessToken);
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : 'Login failed');
    }
  };

  const handleBrandingChange = (key: keyof BrandingConfig, value: string) => {
    setBranding((prev) => ({ ...prev, [key]: value }));
  };

  const handlePreview = () => {
    applyTheme(branding as unknown as Record<string, unknown>, {});
  };

  const handleReset = () => {
    setBranding(DEFAULT_BRANDING);
    resetTheme();
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto mt-12 space-y-6">
        <h1 className="text-2xl font-bold">Login</h1>
        {loginError && <p className="text-red-500 text-sm">{loginError}</p>}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Tenant Slug</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full border border-slate-300 rounded px-3 py-2"
              placeholder="my-company"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">API Key</label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full border border-slate-300 rounded px-3 py-2"
              placeholder="ak_..."
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Login
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Settings</h1>
        <button
          onClick={logout}
          className="text-sm text-red-500 hover:text-red-700"
        >
          Logout
        </button>
      </div>

      <section className="bg-white border border-slate-200 rounded-lg p-6 space-y-4">
        <h2 className="text-lg font-semibold">Branding</h2>
        <p className="text-sm text-slate-500">
          Customize the look and feel of your embedded dashboards.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium mb-1">Primary Color</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={branding.primaryColor}
                onChange={(e) => handleBrandingChange('primaryColor', e.target.value)}
                className="h-10 w-12 border border-slate-300 rounded cursor-pointer"
              />
              <input
                type="text"
                value={branding.primaryColor}
                onChange={(e) => handleBrandingChange('primaryColor', e.target.value)}
                className="flex-1 border border-slate-300 rounded px-3 py-2"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Font Family</label>
            <input
              type="text"
              value={branding.fontFamily}
              onChange={(e) => handleBrandingChange('fontFamily', e.target.value)}
              className="w-full border border-slate-300 rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Background Color</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={branding.backgroundColor}
                onChange={(e) => handleBrandingChange('backgroundColor', e.target.value)}
                className="h-10 w-12 border border-slate-300 rounded cursor-pointer"
              />
              <input
                type="text"
                value={branding.backgroundColor}
                onChange={(e) => handleBrandingChange('backgroundColor', e.target.value)}
                className="flex-1 border border-slate-300 rounded px-3 py-2"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Text Color</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={branding.textColor}
                onChange={(e) => handleBrandingChange('textColor', e.target.value)}
                className="h-10 w-12 border border-slate-300 rounded cursor-pointer"
              />
              <input
                type="text"
                value={branding.textColor}
                onChange={(e) => handleBrandingChange('textColor', e.target.value)}
                className="flex-1 border border-slate-300 rounded px-3 py-2"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handlePreview}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Preview Theme
          </button>
          <button
            onClick={handleReset}
            className="border border-slate-300 px-4 py-2 rounded hover:bg-slate-50"
          >
            Reset to Defaults
          </button>
        </div>
      </section>

      <section className="bg-white border border-slate-200 rounded-lg p-6 space-y-2">
        <h2 className="text-lg font-semibold">Session</h2>
        <p className="text-sm text-slate-500">
          Authenticated with token. Use the API key and tenant slug to manage your analytics configuration.
        </p>
        <p className="text-xs text-slate-400 font-mono truncate">
          Token: {token ? `${token.slice(0, 20)}...` : 'N/A'}
        </p>
      </section>
    </div>
  );
}
