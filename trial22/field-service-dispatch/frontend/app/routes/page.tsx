'use client';

import { useEffect, useState } from 'react';
import { Table } from '@/components/ui/table';

interface Route {
  id: string;
  name: string;
  date: string;
  estimatedDistance: number;
  technician: { name: string };
  workOrders: { id: string; title: string }[];
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

export default function RoutesPage() {
  const [routes, setRoutes] = useState<Route[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) { window.location.href = '/login'; return; }

    fetch(`${API_URL}/api/routes`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => { if (res.ok) return res.json(); throw new Error('Failed'); })
      .then(setRoutes)
      .catch(() => setRoutes([]));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Routes</h1>
      <Table>
        <thead>
          <tr>
            <th className="text-left p-2">Name</th>
            <th className="text-left p-2">Date</th>
            <th className="text-left p-2">Technician</th>
            <th className="text-right p-2">Distance (km)</th>
            <th className="text-right p-2">Work Orders</th>
          </tr>
        </thead>
        <tbody>
          {routes.map((r) => (
            <tr key={r.id} className="border-t border-[var(--border)]">
              <td className="p-2">{r.name}</td>
              <td className="p-2">{new Date(r.date).toLocaleDateString()}</td>
              <td className="p-2">{r.technician?.name}</td>
              <td className="p-2 text-right">{r.estimatedDistance.toFixed(1)}</td>
              <td className="p-2 text-right">{r.workOrders?.length ?? 0}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}
