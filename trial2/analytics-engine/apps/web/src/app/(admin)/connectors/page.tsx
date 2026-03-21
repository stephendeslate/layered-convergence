'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import type { DataSourceSummary } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { ConnectorForm } from '@/components/connectors/ConnectorForm';

export default function ConnectorsPage() {
  const { token } = useAuth();
  const [dataSources, setDataSources] = useState<DataSourceSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (!token) return;
    api.dataSources.list(token).then((res) => {
      setDataSources(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [token]);

  const handleCreated = (ds: DataSourceSummary) => {
    setDataSources((prev) => [...prev, ds]);
    setShowForm(false);
  };

  if (loading) {
    return <p className="text-slate-500">Loading data sources...</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Data Sources</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Add Data Source
        </button>
      </div>

      {showForm && token && (
        <ConnectorForm
          token={token}
          onCreated={handleCreated}
          onCancel={() => setShowForm(false)}
        />
      )}

      {dataSources.length === 0 ? (
        <p className="text-slate-500">No data sources configured yet.</p>
      ) : (
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Name</th>
                <th className="text-left px-4 py-3 font-medium">Type</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-left px-4 py-3 font-medium">Last Sync</th>
                <th className="text-left px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {dataSources.map((ds) => (
                <tr key={ds.id}>
                  <td className="px-4 py-3">{ds.name}</td>
                  <td className="px-4 py-3">
                    <span className="inline-block bg-slate-100 text-slate-700 rounded px-2 py-0.5 text-xs">
                      {ds.type}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded px-2 py-0.5 text-xs ${
                        ds.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {ds.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {ds.lastSyncAt
                      ? new Date(ds.lastSyncAt).toLocaleString()
                      : 'Never'}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/connectors/${ds.id}/sync`}
                      className="text-blue-600 hover:text-blue-800 text-xs"
                    >
                      Sync History
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
