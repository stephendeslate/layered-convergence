'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

interface Widget {
  id: string;
  type: string;
  config: Record<string, unknown>;
  positionX: number;
  positionY: number;
  width: number;
  height: number;
}

interface Dashboard {
  id: string;
  name: string;
  isPublished: boolean;
  widgets: Widget[];
}

export default function DashboardDetailPage() {
  const params = useParams();
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/dashboards/${params.id}`)
      .then((res) => res.json())
      .then(setDashboard)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) return <p className="text-gray-500">Loading...</p>;
  if (!dashboard) return <p className="text-red-500">Dashboard not found.</p>;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">{dashboard.name}</h2>
          <p className="text-sm text-gray-500">
            {dashboard.isPublished ? 'Published' : 'Draft'} &middot; {dashboard.widgets.length} widgets
          </p>
        </div>
        <div className="flex gap-2">
          <button className="rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50">
            Add Widget
          </button>
          <button className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700">
            {dashboard.isPublished ? 'Unpublish' : 'Publish'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        {dashboard.widgets.map((widget) => (
          <div
            key={widget.id}
            className="rounded-lg border border-gray-200 bg-white p-4"
            style={{
              gridColumn: `span ${widget.width}`,
            }}
          >
            <p className="mb-2 text-xs font-medium uppercase text-gray-400">{widget.type}</p>
            <div className="flex h-32 items-center justify-center rounded bg-gray-50 text-sm text-gray-400">
              {widget.type} chart placeholder
            </div>
          </div>
        ))}
      </div>

      {dashboard.widgets.length === 0 && (
        <div className="flex h-64 items-center justify-center rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-gray-400">Add widgets to build your dashboard</p>
        </div>
      )}
    </div>
  );
}
