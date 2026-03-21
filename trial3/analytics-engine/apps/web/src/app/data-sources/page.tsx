'use client';

import { useEffect, useState } from 'react';

interface DataSource {
  id: string;
  name: string;
  type: string;
  isActive: boolean;
  createdAt: string;
}

export default function DataSourcesPage() {
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/data-sources')
      .then((res) => res.json())
      .then(setDataSources)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-gray-500">Loading data sources...</p>;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Data Sources</h2>
        <button className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700">
          Add Data Source
        </button>
      </div>

      {dataSources.length === 0 ? (
        <p className="text-gray-500">No data sources configured.</p>
      ) : (
        <table className="w-full rounded-lg border border-gray-200 bg-white">
          <thead>
            <tr className="border-b border-gray-200 text-left text-sm text-gray-500">
              <th className="p-4">Name</th>
              <th className="p-4">Type</th>
              <th className="p-4">Status</th>
              <th className="p-4">Created</th>
            </tr>
          </thead>
          <tbody>
            {dataSources.map((ds) => (
              <tr key={ds.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="p-4 font-medium">
                  <a href={`/data-sources/${ds.id}`} className="text-blue-600 hover:underline">
                    {ds.name}
                  </a>
                </td>
                <td className="p-4">
                  <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium uppercase">
                    {ds.type}
                  </span>
                </td>
                <td className="p-4">
                  {ds.isActive ? (
                    <span className="text-green-600">Active</span>
                  ) : (
                    <span className="text-gray-400">Inactive</span>
                  )}
                </td>
                <td className="p-4 text-sm text-gray-500">
                  {new Date(ds.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
