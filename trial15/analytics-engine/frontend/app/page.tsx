import { Suspense } from "react";
import { apiClient, getServerRequestOptions } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

async function DataSourceSummary() {
  const options = await getServerRequestOptions();
  const response = await apiClient.getDataSources(options);
  const dataSources = response.data;

  const connectedCount = dataSources.filter((ds) => ds.status === "connected").length;
  const syncingCount = dataSources.filter((ds) => ds.status === "syncing").length;
  const errorCount = dataSources.filter((ds) => ds.status === "error").length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Data Sources</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold">{response.total}</p>
        <p className="mt-1 text-sm text-muted-foreground">Total configured</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Badge variant="success">{connectedCount} connected</Badge>
          {syncingCount > 0 && <Badge variant="warning">{syncingCount} syncing</Badge>}
          {errorCount > 0 && <Badge variant="destructive">{errorCount} errors</Badge>}
        </div>
      </CardContent>
    </Card>
  );
}

async function PipelineSummary() {
  const options = await getServerRequestOptions();
  const response = await apiClient.getPipelines(options);
  const pipelines = response.data;

  const runningCount = pipelines.filter((p) => p.status === "running").length;
  const completedCount = pipelines.filter((p) => p.status === "completed").length;
  const failedCount = pipelines.filter((p) => p.status === "failed").length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Pipelines</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold">{response.total}</p>
        <p className="mt-1 text-sm text-muted-foreground">Total pipelines</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {runningCount > 0 && <Badge variant="warning">{runningCount} running</Badge>}
          <Badge variant="success">{completedCount} completed</Badge>
          {failedCount > 0 && <Badge variant="destructive">{failedCount} failed</Badge>}
        </div>
      </CardContent>
    </Card>
  );
}

async function DashboardSummary() {
  const options = await getServerRequestOptions();
  const response = await apiClient.getDashboards(options);

  const totalWidgets = response.data.reduce(
    (sum, dashboard) => sum + dashboard.widgets.length,
    0
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Dashboards</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold">{response.total}</p>
        <p className="mt-1 text-sm text-muted-foreground">Active dashboards</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Badge variant="secondary">{totalWidgets} widgets</Badge>
        </div>
      </CardContent>
    </Card>
  );
}

function SummaryCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="h-5 w-24 animate-pulse rounded bg-muted" />
      </CardHeader>
      <CardContent>
        <div className="h-9 w-16 animate-pulse rounded bg-muted" />
        <div className="mt-2 h-4 w-32 animate-pulse rounded bg-muted" />
        <div className="mt-4 flex gap-2">
          <div className="h-5 w-20 animate-pulse rounded-full bg-muted" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardOverviewPage() {
  return (
    <div className="container mx-auto space-y-8 p-6">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Suspense fallback={<SummaryCardSkeleton />}>
          <DataSourceSummary />
        </Suspense>
        <Suspense fallback={<SummaryCardSkeleton />}>
          <PipelineSummary />
        </Suspense>
        <Suspense fallback={<SummaryCardSkeleton />}>
          <DashboardSummary />
        </Suspense>
      </div>
    </div>
  );
}
