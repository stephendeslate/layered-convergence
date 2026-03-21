'use client';

import { useEffect, useState } from 'react';

interface WorkOrder {
  id: string;
  description: string;
  status: string;
  priority: string;
  serviceType: string;
  scheduledAt: string | null;
  customer: { name: string };
  technician: { name: string } | null;
}

const PRIORITY_COLORS: Record<string, string> = {
  LOW: 'bg-gray-100 text-gray-600',
  MEDIUM: 'bg-blue-100 text-blue-700',
  HIGH: 'bg-orange-100 text-orange-700',
  URGENT: 'bg-red-100 text-red-700',
};

const STATUS_COLORS: Record<string, string> = {
  UNASSIGNED: 'bg-gray-100 text-gray-600',
  ASSIGNED: 'bg-blue-100 text-blue-700',
  EN_ROUTE: 'bg-yellow-100 text-yellow-700',
  ON_SITE: 'bg-purple-100 text-purple-700',
  IN_PROGRESS: 'bg-indigo-100 text-indigo-700',
  COMPLETED: 'bg-green-100 text-green-700',
  INVOICED: 'bg-emerald-100 text-emerald-700',
  PAID: 'bg-teal-100 text-teal-700',
};

export default function WorkOrdersPage() {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/work-orders')
      .then((res) => res.json())
      .then(setWorkOrders)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-gray-500">Loading work orders...</p>;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Work Orders</h2>
        <button className="rounded-md bg-orange-600 px-4 py-2 text-sm text-white hover:bg-orange-700">
          Create Work Order
        </button>
      </div>

      {workOrders.length === 0 ? (
        <p className="text-gray-500">No work orders yet.</p>
      ) : (
        <table className="w-full rounded-lg border border-gray-200 bg-white">
          <thead>
            <tr className="border-b border-gray-200 text-left text-sm text-gray-500">
              <th className="p-4">Description</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Technician</th>
              <th className="p-4">Priority</th>
              <th className="p-4">Status</th>
              <th className="p-4">Scheduled</th>
            </tr>
          </thead>
          <tbody>
            {workOrders.map((wo) => (
              <tr key={wo.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="p-4">
                  <a href={`/work-orders/${wo.id}`} className="text-orange-600 hover:underline">
                    {wo.description}
                  </a>
                </td>
                <td className="p-4 text-sm">{wo.customer.name}</td>
                <td className="p-4 text-sm">{wo.technician?.name ?? 'Unassigned'}</td>
                <td className="p-4">
                  <span className={`rounded-full px-2 py-1 text-xs font-medium ${PRIORITY_COLORS[wo.priority] ?? ''}`}>
                    {wo.priority}
                  </span>
                </td>
                <td className="p-4">
                  <span className={`rounded-full px-2 py-1 text-xs font-medium ${STATUS_COLORS[wo.status] ?? ''}`}>
                    {wo.status}
                  </span>
                </td>
                <td className="p-4 text-sm text-gray-500">
                  {wo.scheduledAt ? new Date(wo.scheduledAt).toLocaleDateString() : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
