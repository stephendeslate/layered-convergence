import { Suspense } from 'react';
import { getRoutes } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { formatDate } from '@/lib/utils';

async function RouteList() {
  const routes = await getRoutes();

  if (routes.length === 0) {
    return <p className="text-slate-500">No routes found.</p>;
  }

  return (
    <div className="space-y-3" role="list" aria-label="Routes">
      {routes.map((route) => (
        <div key={route.id} role="listitem">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{route.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 text-sm text-slate-500">
                <span>Date: {formatDate(route.date)}</span>
                {route.technician && <span>Technician: {route.technician.name}</span>}
                {route.distance && <span>Distance: {route.distance.toFixed(1)} km</span>}
                {route.estimatedTime && <span>Est. Time: {route.estimatedTime} min</span>}
              </div>
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  );
}

export default function RoutesPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Routes</h1>
      <Suspense fallback={<div className="animate-pulse space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-24 bg-slate-200 rounded-lg" />)}</div>}>
        <RouteList />
      </Suspense>
    </div>
  );
}
