import { Suspense } from "react";
import Link from "next/link";
import { getWorkOrders } from "@/lib/api";
import { WorkOrderCard } from "@/components/work-orders/work-order-card";
import { Button } from "@/components/ui/button";
import { WORK_ORDER_STATUSES } from "@/lib/types";
import type { WorkOrderStatus } from "@/lib/types";
import { statusLabel } from "@/lib/utils";
import { Plus } from "lucide-react";

function WorkOrderListSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse rounded-lg border bg-card p-6"
        >
          <div className="mb-3 flex justify-between">
            <div className="h-5 w-32 rounded bg-muted" />
            <div className="h-5 w-20 rounded bg-muted" />
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

async function WorkOrderList({
  status,
}: {
  status?: string;
}) {
  const workOrders = await getWorkOrders(status);

  if (workOrders.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">
          No work orders found
          {status ? ` with status "${statusLabel(status)}"` : ""}.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {workOrders.map((workOrder) => (
        <WorkOrderCard key={workOrder.id} workOrder={workOrder} />
      ))}
    </div>
  );
}

interface WorkOrdersPageProps {
  searchParams: Promise<{ status?: string }>;
}

export default async function WorkOrdersPage({
  searchParams,
}: WorkOrdersPageProps) {
  const params = await searchParams;
  const activeStatus = params.status;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Work Orders</h1>
        <Link href="/work-orders/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
            New Work Order
          </Button>
        </Link>
      </div>

      <nav aria-label="Filter by status" className="mb-6">
        <div className="flex flex-wrap gap-2">
          <Link href="/work-orders">
            <Button
              variant={activeStatus === undefined ? "default" : "outline"}
              size="sm"
            >
              All
            </Button>
          </Link>
          {WORK_ORDER_STATUSES.map((status) => (
            <Link
              key={status}
              href={`/work-orders?status=${status}`}
            >
              <Button
                variant={
                  activeStatus === status ? "default" : "outline"
                }
                size="sm"
              >
                {statusLabel(status)}
              </Button>
            </Link>
          ))}
        </div>
      </nav>

      <Suspense fallback={<WorkOrderListSkeleton />}>
        <WorkOrderList status={activeStatus} />
      </Suspense>
    </div>
  );
}
