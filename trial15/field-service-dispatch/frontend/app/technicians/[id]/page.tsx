import { Suspense } from "react";
import Link from "next/link";
import { getTechnician, getWorkOrders } from "@/lib/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AvailabilityIndicator } from "@/components/technicians/availability-indicator";
import { StatusBadge } from "@/components/work-orders/status-badge";
import { formatDate } from "@/lib/utils";
import {
  ArrowLeft,
  Calendar,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";

function TechnicianDetailSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 w-48 rounded bg-muted" />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border p-6 space-y-4">
          <div className="h-6 w-32 rounded bg-muted" />
          <div className="h-4 w-full rounded bg-muted" />
          <div className="h-4 w-2/3 rounded bg-muted" />
        </div>
        <div className="rounded-lg border p-6 space-y-4">
          <div className="h-6 w-32 rounded bg-muted" />
          <div className="h-4 w-full rounded bg-muted" />
        </div>
      </div>
    </div>
  );
}

async function TechnicianDetail({ id }: { id: string }) {
  const [technician, allWorkOrders] = await Promise.all([
    getTechnician(id),
    getWorkOrders(),
  ]);

  const assignedWorkOrders = allWorkOrders.filter(
    (wo) => wo.technicianId === id
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/technicians">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to technicians</span>
          </Button>
        </Link>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">{technician.name}</h1>
          <AvailabilityIndicator availability={technician.availability} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <Mail
                className="h-4 w-4 text-muted-foreground"
                aria-hidden="true"
              />
              <span>{technician.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone
                className="h-4 w-4 text-muted-foreground"
                aria-hidden="true"
              />
              <span>{technician.phone}</span>
            </div>
            {technician.latitude !== null &&
              technician.longitude !== null && (
                <div className="flex items-center gap-2">
                  <MapPin
                    className="h-4 w-4 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <span>
                    {technician.latitude.toFixed(4)},{" "}
                    {technician.longitude.toFixed(4)}
                  </span>
                </div>
              )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Skills</CardTitle>
          </CardHeader>
          <CardContent>
            {technician.skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {technician.skills.map((skill) => (
                  <Badge key={skill} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No skills listed
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            Assigned Work Orders ({assignedWorkOrders.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {assignedWorkOrders.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No work orders assigned
            </p>
          ) : (
            <div className="space-y-3">
              {assignedWorkOrders.map((wo) => (
                <Link
                  key={wo.id}
                  href={`/work-orders/${wo.id}`}
                  className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
                >
                  <div className="flex-1">
                    <p className="font-medium">{wo.title}</p>
                    <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3" aria-hidden="true" />
                      <span className="line-clamp-1">{wo.address}</span>
                    </div>
                    {wo.scheduledDate && (
                      <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar
                          className="h-3 w-3"
                          aria-hidden="true"
                        />
                        <span>{formatDate(wo.scheduledDate)}</span>
                      </div>
                    )}
                  </div>
                  <StatusBadge status={wo.status} />
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

interface TechnicianDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function TechnicianDetailPage({
  params,
}: TechnicianDetailPageProps) {
  const { id } = await params;

  return (
    <Suspense fallback={<TechnicianDetailSkeleton />}>
      <TechnicianDetail id={id} />
    </Suspense>
  );
}
