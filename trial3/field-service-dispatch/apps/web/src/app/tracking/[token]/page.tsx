'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

/**
 * Public customer-facing tracking page.
 * Shows work order status and live technician location on a Leaflet map.
 * No authentication required — accessed via unique tracking token.
 */

interface TrackingData {
  workOrderId: string;
  status: string;
  technician: {
    name: string;
    lat: number | null;
    lng: number | null;
    lastLocationAt: string | null;
  } | null;
  destination: {
    name: string;
    address: string;
    lat: number;
    lng: number;
  };
  company: {
    name: string;
    primaryColor: string;
    logoUrl: string | null;
  };
}

export default function TrackingPage() {
  const params = useParams();
  const [tracking, setTracking] = useState<TrackingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/work-orders/tracking/${params.token}`)
      .then((res) => {
        if (!res.ok) throw new Error('Tracking link not found');
        return res.json();
      })
      .then(setTracking)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [params.token]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Loading tracking information...</p>
      </div>
    );
  }

  if (error || !tracking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-red-500">Unable to load tracking information.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6 text-center">
        <h1 className="text-xl font-bold" style={{ color: tracking.company.primaryColor }}>
          {tracking.company.name}
        </h1>
        <p className="mt-1 text-sm text-gray-500">Service Tracking</p>
      </div>

      <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">Current Status</p>
          <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
            {tracking.status.replace(/_/g, ' ')}
          </span>
        </div>

        {tracking.technician && (
          <div className="mt-4 border-t border-gray-100 pt-4">
            <p className="text-sm text-gray-500">Your Technician</p>
            <p className="font-medium">{tracking.technician.name}</p>
          </div>
        )}

        <div className="mt-4 border-t border-gray-100 pt-4">
          <p className="text-sm text-gray-500">Service Location</p>
          <p className="font-medium">{tracking.destination.name}</p>
          <p className="text-sm text-gray-500">{tracking.destination.address}</p>
        </div>
      </div>

      {/* Map placeholder for Leaflet */}
      <div className="flex h-64 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-white">
        <p className="text-sm text-gray-400">
          Leaflet map showing technician en route to {tracking.destination.address}
        </p>
      </div>
    </div>
  );
}
