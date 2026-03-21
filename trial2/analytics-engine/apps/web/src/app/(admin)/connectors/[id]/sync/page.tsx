'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import type { SyncRun } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  running: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
};

export default function SyncHistoryPage() {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const [runs, setRuns] = useState<SyncRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(false);

  const fetchHistory = () => {
    if (!token || !id) return;
    api.dataSources.syncHistory(token, id).then((res) => {
      setRuns(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchHistory();
  }, [token, id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleTrigger = async () => {
    if (!token || !id) return;
    setTriggering(true);
    try {
      await api.dataSources.triggerSync(token, id);
      setTimeout(fetchHistory, 1000);
    } finally {
      setTriggering(false);
    }
  };

  if (loading) {
    return <p className="text-slate-500">Loading sync history...</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/connectors" className="text-blue-600 hover:text-blue-800 text-sm">
            &larr; Back to Data Sources
          </Link>
          <h1 className="text-2xl font-bold mt-1">Sync History</h1>
        </div>
        <button
          onClick={handleTrigger}
          disabled={triggering}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {triggering ? 'Triggering...' : 'Trigger Sync'}
        </button>
      </div>

      {runs.length === 0 ? (
        <p className="text-slate-500">No sync runs yet.</p>
      ) : (
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-left px-4 py-3 font-medium">Rows Ingested</th>
                <th className="text-left px-4 py-3 font-medium">Started</th>
                <th className="text-left px-4 py-3 font-medium">Completed</th>
                <th className="text-left px-4 py-3 font-medium">Error</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {runs.map((run) => (
                <tr key={run.id}>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded px-2 py-0.5 text-xs ${
                        STATUS_STYLES[run.status] ?? 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {run.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">{run.rowsIngested.toLocaleString()}</td>
                  <td className="px-4 py-3 text-slate-500">
                    {new Date(run.startedAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {run.completedAt ? new Date(run.completedAt).toLocaleString() : '-'}
                  </td>
                  <td className="px-4 py-3">
                    {run.errorLog ? (
                      <span className="text-red-500 text-xs truncate block max-w-xs" title={run.errorLog}>
                        {run.errorLog}
                      </span>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
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
