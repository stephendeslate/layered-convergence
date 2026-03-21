'use client';

import { useEffect, useState } from 'react';

interface Dashboard {
  id: string;
  name: string;
  isPublished: boolean;
  createdAt: string;
  widgets: { id: string }[];
}

export default function DashboardsPage() {
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboards')
      .then((res) => res.json())
      .then(setDashboards)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-gray-500">Loading dashboards...</p>;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Dashboards</h2>
        <button className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700">
          Create Dashboard
        </button>
      </div>

      {dashboards.length === 0 ? (
        <p className="text-gray-500">No dashboards yet. Create your first one.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {dashboards.map((d) => (
            <a
              key={d.id}
              href={`/dashboards/${d.id}`}
              className="rounded-lg border border-gray-200 bg-white p-4 hover:shadow-md"
            >
              <h3 className="font-medium">{d.name}</h3>
              <p className="mt-1 text-sm text-gray-500">
                {d.widgets.length} widgets &middot;{' '}
                {d.isPublished ? (
                  <span className="text-green-600">Published</span>
                ) : (
                  <span className="text-gray-400">Draft</span>
                )}
              </p>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
