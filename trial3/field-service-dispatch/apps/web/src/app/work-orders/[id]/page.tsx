'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

interface WorkOrderDetail {
  id: string;
  description: string;
  status: string;
  priority: string;
  serviceType: string;
  scheduledAt: string | null;
  completedAt: string | null;
  trackingToken: string;
  customer: { name: string; address: string; phone: string | null };
  technician: { id: string; name: string } | null;
  statusHistory: { id: string; fromStatus: string; toStatus: string; note: string | null; timestamp: string }[];
  photos: { id: string; url: string; caption: string | null }[];
  invoice: { id: string; amount: number; status: string } | null;
}

export default function WorkOrderDetailPage() {
  const params = useParams();
  const [workOrder, setWorkOrder] = useState<WorkOrderDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/work-orders/${params.id}`)
      .then((res) => res.json())
      .then(setWorkOrder)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) return <p className="text-gray-500">Loading...</p>;
  if (!workOrder) return <p className="text-red-500">Work order not found.</p>;

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-semibold">{workOrder.description}</h2>
          <p className="mt-1 text-sm text-gray-500">
            {workOrder.serviceType} &middot; {workOrder.priority} priority
          </p>
        </div>
        <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
          {workOrder.status}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-xs font-medium uppercase text-gray-400">Customer</p>
          <p className="mt-1 font-medium">{workOrder.customer.name}</p>
          <p className="text-sm text-gray-500">{workOrder.customer.address}</p>
          {workOrder.customer.phone && (
            <p className="text-sm text-gray-500">{workOrder.customer.phone}</p>
          )}
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-xs font-medium uppercase text-gray-400">Technician</p>
          {workOrder.technician ? (
            <p className="mt-1 font-medium">{workOrder.technician.name}</p>
          ) : (
            <p className="mt-1 text-gray-400">Unassigned</p>
          )}
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-xs font-medium uppercase text-gray-400">Tracking Link</p>
          <a
            href={`/tracking/${workOrder.trackingToken}`}
            className="mt-1 block text-sm text-orange-600 hover:underline"
          >
            Share with customer
          </a>
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-semibold">Status History</h3>
        <div className="space-y-2">
          {workOrder.statusHistory.map((entry) => (
            <div key={entry.id} className="flex items-center gap-3 rounded bg-white p-3 text-sm">
              <span className="font-medium text-gray-400">{entry.fromStatus}</span>
              <span className="text-gray-300">&rarr;</span>
              <span className="font-medium">{entry.toStatus}</span>
              {entry.note && <span className="text-gray-500">- {entry.note}</span>}
              <span className="ml-auto text-xs text-gray-400">
                {new Date(entry.timestamp).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>

      {workOrder.invoice && (
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <h3 className="mb-2 text-lg font-semibold">Invoice</h3>
          <p>Amount: ${(workOrder.invoice.amount / 100).toFixed(2)}</p>
          <p className="text-sm text-gray-500">Status: {workOrder.invoice.status}</p>
        </div>
      )}
    </div>
  );
}
