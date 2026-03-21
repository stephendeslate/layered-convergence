import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { apiClient, getServerRequestOptions } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Dashboards - Analytics Engine",
  description: "View and manage your analytics dashboards",
};

async function DashboardList() {
  const options = await getServerRequestOptions();
  const response = await apiClient.getDashboards(options);
  const dashboards = response.data;

  if (dashboards.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center p-12">
          <p className="text-lg font-medium text-muted-foreground">
            No dashboards yet
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Create your first dashboard to start visualizing data.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {dashboards.map((dashboard) => (
        <Link key={dashboard.id} href={`/dashboards/${dashboard.id}`}>
          <Card className="transition-shadow hover:shadow-md">
            <CardHeader>
              <CardTitle className="text-lg">{dashboard.name}</CardTitle>
              <CardDescription>{dashboard.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Badge variant="secondary">
                  {dashboard.widgets.length} widget{dashboard.widgets.length !== 1 ? "s" : ""}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  Updated {new Date(dashboard.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}

function DashboardListSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <div className="h-5 w-32 animate-pulse rounded bg-muted" />
            <div className="mt-2 h-4 w-48 animate-pulse rounded bg-muted" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="h-5 w-16 animate-pulse rounded-full bg-muted" />
              <div className="h-3 w-24 animate-pulse rounded bg-muted" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function DashboardsPage() {
  return (
    <div className="container mx-auto space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboards</h1>
      </div>
      <Suspense fallback={<DashboardListSkeleton />}>
        <DashboardList />
      </Suspense>
    </div>
  );
}
