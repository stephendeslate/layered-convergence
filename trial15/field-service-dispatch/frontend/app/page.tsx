import { Suspense } from "react";
import { getWorkOrders } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/work-orders/status-badge";
import type { WorkOrderStatus, StatusCounts } from "@/lib/types";
import { WORK_ORDER_STATUSES } from "@/lib/types";

function StatusBoardSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 9 }).map((_, i) => (
        <Card key={i} className="animate-pulse">
          <CardHeader className="pb-2">
            <div className="h-5 w-24 rounded bg-muted" />
          </CardHeader>
          <CardContent>
            <div className="h-10 w-16 rounded bg-muted" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

async function StatusBoard() {
  const workOrders = await getWorkOrders();

  const counts = WORK_ORDER_STATUSES.reduce<StatusCounts>(
    (acc, status) => {
      acc[status] = workOrders.filter((wo) => wo.status === status).length;
      return acc;
    },
    {
      CREATED: 0,
      ASSIGNED: 0,
      EN_ROUTE: 0,
      IN_PROGRESS: 0,
      ON_HOLD: 0,
      COMPLETED: 0,
      INVOICED: 0,
      PAID: 0,
      CLOSED: 0,
    }
  );

  const totalActive = workOrders.filter(
    (wo) =>
      wo.status !== "CLOSED" &&
      wo.status !== "PAID" &&
      wo.status !== "INVOICED"
  ).length;

  return (
    <>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-sm text-muted-foreground">Total Work Orders</p>
              <p className="text-3xl font-bold">{workOrders.length}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active</p>
              <p className="text-3xl font-bold">{totalActive}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Completed Today</p>
              <p className="text-3xl font-bold">
                {workOrders.filter(
                  (wo) =>
                    wo.completedAt &&
                    new Date(wo.completedAt).toDateString() ===
                      new Date().toDateString()
                ).length}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <h2 className="mb-4 text-lg font-semibold">Status Board</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {WORK_ORDER_STATUSES.map((status) => (
          <Card key={status}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <StatusBadge status={status as WorkOrderStatus} />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{counts[status]}</p>
              <p className="text-xs text-muted-foreground">work orders</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}

export default function DashboardPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Dashboard</h1>
      <Suspense fallback={<StatusBoardSkeleton />}>
        <StatusBoard />
      </Suspense>
    </div>
  );
}
