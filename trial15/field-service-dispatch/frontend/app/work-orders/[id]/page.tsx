import { Suspense } from "react";
import Link from "next/link";
import { getWorkOrder } from "@/lib/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/work-orders/status-badge";
import { WorkOrderTimeline } from "@/components/work-orders/work-order-timeline";
import { TransitionButtons } from "@/components/work-orders/transition-buttons";
import { formatDate, formatDateTime, formatDuration } from "@/lib/utils";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Mail,
  MapPin,
  Phone,
  User,
  Wrench,
} from "lucide-react";

function WorkOrderDetailSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 w-64 rounded bg-muted" />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-lg border p-6 space-y-4">
            <div className="h-6 w-48 rounded bg-muted" />
            <div className="h-4 w-full rounded bg-muted" />
            <div className="h-4 w-2/3 rounded bg-muted" />
          </div>
        </div>
        <div className="space-y-6">
          <div className="rounded-lg border p-6 h-64 bg-muted" />
        </div>
      </div>
    </div>
  );
}

async function WorkOrderDetail({ id }: { id: string }) {
  const workOrder = await getWorkOrder(id);

  const priorityColors: Record<string, string> = {
    LOW: "bg-slate-100 text-slate-700 border-slate-300",
    MEDIUM: "bg-blue-100 text-blue-700 border-blue-300",
    HIGH: "bg-amber-100 text-amber-700 border-amber-300",
    URGENT: "bg-red-100 text-red-700 border-red-300",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/work-orders">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to work orders</span>
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{workOrder.title}</h1>
            <StatusBadge status={workOrder.status} />
            <Badge
              variant="outline"
              className={priorityColors[workOrder.priority]}
            >
              {workOrder.priority}
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">
                  Description
                </h3>
                <p className="mt-1">{workOrder.description}</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin
                    className="h-4 w-4 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <span>{workOrder.address}</span>
                </div>
                {workOrder.scheduledDate && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar
                      className="h-4 w-4 text-muted-foreground"
                      aria-hidden="true"
                    />
                    <span>{formatDate(workOrder.scheduledDate)}</span>
                  </div>
                )}
                {workOrder.estimatedDuration && (
                  <div className="flex items-center gap-2 text-sm">
                    <Clock
                      className="h-4 w-4 text-muted-foreground"
                      aria-hidden="true"
                    />
                    <span>
                      {formatDuration(workOrder.estimatedDuration)}
                    </span>
                  </div>
                )}
              </div>

              {workOrder.notes && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Notes
                  </h3>
                  <p className="mt-1 text-sm">{workOrder.notes}</p>
                </div>
              )}

              <div className="border-t pt-4 text-xs text-muted-foreground">
                <p>Created: {formatDateTime(workOrder.createdAt)}</p>
                <p>Updated: {formatDateTime(workOrder.updatedAt)}</p>
                {workOrder.completedAt && (
                  <p>Completed: {formatDateTime(workOrder.completedAt)}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {workOrder.customer && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Customer</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <User
                    className="h-4 w-4 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <span className="font-medium">
                    {workOrder.customer.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail
                    className="h-4 w-4 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <span>{workOrder.customer.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone
                    className="h-4 w-4 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <span>{workOrder.customer.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin
                    className="h-4 w-4 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <span>{workOrder.customer.address}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {workOrder.technician && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Assigned Technician
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Wrench
                    className="h-4 w-4 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <Link
                    href={`/technicians/${workOrder.technician.id}`}
                    className="font-medium text-primary underline"
                  >
                    {workOrder.technician.name}
                  </Link>
                </div>
                <div className="flex items-center gap-2">
                  <Mail
                    className="h-4 w-4 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <span>{workOrder.technician.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone
                    className="h-4 w-4 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <span>{workOrder.technician.phone}</span>
                </div>
                {workOrder.technician.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {workOrder.technician.skills.map((skill) => (
                      <Badge
                        key={skill}
                        variant="secondary"
                        className="text-xs"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <TransitionButtons
                workOrderId={workOrder.id}
                currentStatus={workOrder.status}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Lifecycle Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <WorkOrderTimeline currentStatus={workOrder.status} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

interface WorkOrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function WorkOrderDetailPage({
  params,
}: WorkOrderDetailPageProps) {
  const { id } = await params;

  return (
    <Suspense fallback={<WorkOrderDetailSkeleton />}>
      <WorkOrderDetail id={id} />
    </Suspense>
  );
}
