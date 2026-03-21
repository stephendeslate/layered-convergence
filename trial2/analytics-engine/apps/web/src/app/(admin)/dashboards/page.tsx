'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import type { Dashboard } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';

export default function DashboardsPage() {
  const { token } = useAuth();
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!token) return;
    api.dashboards.list(token).then((res) => {
      setDashboards(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [token]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !newName.trim()) return;
    setCreating(true);
    try {
      const created = await api.dashboards.create(token, { name: newName.trim() });
      setDashboards((prev) => [...prev, created]);
      setNewName('');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!token) return;
    await api.dashboards.delete(token, id);
    setDashboards((prev) => prev.filter((d) => d.id !== id));
  };

  if (loading) {
    return <p className="text-slate-500">Loading dashboards...</p>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboards</h1>

      <form onSubmit={handleCreate} className="flex gap-2">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New dashboard name"
          className="border border-slate-300 rounded px-3 py-2 flex-1"
        />
        <button
          type="submit"
          disabled={creating || !newName.trim()}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          Create
        </button>
      </form>

      {dashboards.length === 0 ? (
        <p className="text-slate-500">No dashboards yet. Create one to get started.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {dashboards.map((d) => (
            <div key={d.id} className="border border-slate-200 rounded-lg p-4 bg-white">
              <Link href={`/dashboards/${d.id}`} className="text-lg font-semibold hover:text-blue-600">
                {d.name}
              </Link>
              <p className="text-sm text-slate-500 mt-1">{d.description ?? 'No description'}</p>
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-slate-400">
                  {d.widgetCount} widget{d.widgetCount !== 1 ? 's' : ''}
                </span>
                <button
                  onClick={() => handleDelete(d.id)}
                  className="text-xs text-red-500 hover:text-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
