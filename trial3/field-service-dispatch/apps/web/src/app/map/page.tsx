'use client';

import { useEffect, useState } from 'react';

/**
 * Live Map page using Leaflet/OpenStreetMap (NO Google Maps per BUILD_PLAN).
 *
 * In a full implementation, this would use react-leaflet to render the map.
 * The map component loads tile layers from OpenStreetMap and displays
 * real-time technician locations via WebSocket connection.
 */

interface TechnicianLocation {
  technicianId: string;
  name: string;
  lat: number | null;
  lng: number | null;
  lastLocationAt: string | null;
  activeWorkOrder: {
    id: string;
    status: string;
    customer: { name: string; address: string };
  } | null;
}

export default function LiveMapPage() {
  const [locations, setLocations] = useState<TechnicianLocation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/gps/active-locations')
      .then((res) => res.json())
      .then(setLocations)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h2 className="mb-6 text-2xl font-semibold">Live Map</h2>

      <div className="grid grid-cols-4 gap-6">
        {/* Map placeholder — in production, this would be a Leaflet map */}
        <div className="col-span-3 flex h-[600px] items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-white">
          <div className="text-center text-gray-400">
            <p className="text-lg font-medium">Leaflet / OpenStreetMap</p>
            <p className="text-sm">
              Real-time technician tracking map.
              <br />
              Tile source: OpenStreetMap (no Google Maps).
            </p>
            <p className="mt-4 text-xs">
              {loading ? 'Loading locations...' : `${locations.length} active technicians`}
            </p>
          </div>
        </div>

        {/* Technician sidebar */}
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-700">Active Technicians</h3>
          {loading ? (
            <p className="text-sm text-gray-500">Loading...</p>
          ) : locations.length === 0 ? (
            <p className="text-sm text-gray-500">No active technicians.</p>
          ) : (
            locations.map((loc) => (
              <div key={loc.technicianId} className="rounded-lg border border-gray-200 bg-white p-3">
                <p className="font-medium">{loc.name}</p>
                {loc.activeWorkOrder && (
                  <p className="mt-1 text-xs text-gray-500">
                    {loc.activeWorkOrder.status} &middot; {loc.activeWorkOrder.customer.name}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-400">
                  {loc.lat?.toFixed(4)}, {loc.lng?.toFixed(4)}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
