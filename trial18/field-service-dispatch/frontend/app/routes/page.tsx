import { Suspense } from 'react';
import { fetchRoutes } from '@/lib/api';
import { formatDate } from '@/lib/utils';

async function RoutesList() {
  const routes = await fetchRoutes();

  return (
    <div className="space-y-4">
      {routes.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No routes yet.</p>
      ) : (
        routes.map((route) => (
          <div key={route.id} className="bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="font-semibold text-lg">{route.name}</h2>
                <p className="text-sm text-gray-600">
                  Technician: {route.technician?.name ?? 'Unknown'}
                </p>
                <p className="text-sm text-gray-600">
                  Date: {formatDate(route.date)}
                </p>
              </div>
              <div className="text-right">
                <span className="text-sm font-medium text-gray-900">
                  {route.distance.toFixed(1)} mi
                </span>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default function RoutesPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Routes</h1>
      <Suspense fallback={<div className="animate-pulse h-64 bg-gray-200 rounded" />}>
        <RoutesList />
      </Suspense>
    </div>
  );
}
