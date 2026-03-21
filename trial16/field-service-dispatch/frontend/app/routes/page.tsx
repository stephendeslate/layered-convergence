import { Suspense } from 'react';
import { getRoutes } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { formatDate, formatDistance, formatDuration } from '@/lib/utils';

async function RouteList() {
  const routes = await getRoutes();

  if (routes.length === 0) {
    return (
      <p className="text-muted-foreground text-center py-8">
        No routes planned yet.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {routes.map((route) => (
        <Card key={route.id}>
          <CardHeader>
            <CardTitle className="text-base">{route.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Date:</span>{' '}
                {formatDate(route.date)}
              </div>
              <div>
                <span className="text-muted-foreground">Distance:</span>{' '}
                {formatDistance(route.distance)}
              </div>
              <div>
                <span className="text-muted-foreground">Est. Time:</span>{' '}
                {formatDuration(route.estimatedTime)}
              </div>
              <div>
                <span className="text-muted-foreground">Waypoints:</span>{' '}
                {route.waypoints?.length ?? 0}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function RoutesPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Route Planning</h1>
      <Suspense fallback={<RouteListSkeleton />}>
        <RouteList />
      </Suspense>
    </div>
  );
}

function RouteListSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-40 bg-muted rounded animate-pulse" />
      ))}
    </div>
  );
}
