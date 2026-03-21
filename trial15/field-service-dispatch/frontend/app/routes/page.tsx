import { Suspense } from "react";
import { getRoutes } from "@/lib/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/work-orders/status-badge";
import { formatDate, formatDistance, formatDuration } from "@/lib/utils";
import {
  Calendar,
  Clock,
  MapPin,
  Navigation,
  User,
} from "lucide-react";

function RoutesListSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse rounded-lg border bg-card p-6"
        >
          <div className="mb-4 flex justify-between">
            <div className="h-6 w-48 rounded bg-muted" />
            <div className="h-6 w-24 rounded bg-muted" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-full rounded bg-muted" />
            <div className="h-4 w-2/3 rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}

async function RoutesList() {
  const routes = await getRoutes();

  if (routes.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">No routes planned.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {routes.map((route) => (
        <Card key={route.id}>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle className="text-lg">
                  {route.technician
                    ? route.technician.name
                    : `Technician ${route.technicianId.slice(0, 8)}`}
                </CardTitle>
                <div className="mt-1 flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" aria-hidden="true" />
                    <span>{formatDate(route.date)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Navigation className="h-4 w-4" aria-hidden="true" />
                    <span>{formatDistance(route.totalDistance)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" aria-hidden="true" />
                    <span>{formatDuration(route.estimatedDuration)}</span>
                  </div>
                </div>
              </div>
              <Badge variant="secondary">
                {route.workOrderIds.length} stop
                {route.workOrderIds.length !== 1 ? "s" : ""}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {route.workOrders && route.workOrders.length > 0 ? (
              <ol className="space-y-3">
                {route.workOrders.map((wo, index) => (
                  <li key={wo.id} className="flex items-start gap-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                      {index + 1}
                    </div>
                    <div className="flex-1 rounded-lg border p-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-medium">{wo.title}</p>
                        <StatusBadge status={wo.status} />
                      </div>
                      <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin
                          className="h-3 w-3"
                          aria-hidden="true"
                        />
                        <span className="line-clamp-1">
                          {wo.address}
                        </span>
                      </div>
                      {wo.customer && (
                        <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                          <User
                            className="h-3 w-3"
                            aria-hidden="true"
                          />
                          <span>{wo.customer.name}</span>
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              <div className="text-sm text-muted-foreground">
                <p>
                  {route.workOrderIds.length} work order
                  {route.workOrderIds.length !== 1 ? "s" : ""} on this
                  route
                </p>
                <ul className="mt-2 space-y-1">
                  {route.workOrderIds.map((woId) => (
                    <li key={woId} className="font-mono text-xs">
                      {woId}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function RoutesPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Routes</h1>
      <Suspense fallback={<RoutesListSkeleton />}>
        <RoutesList />
      </Suspense>
    </div>
  );
}
