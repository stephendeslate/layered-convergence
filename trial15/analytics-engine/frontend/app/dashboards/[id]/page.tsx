import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { apiClient, getServerRequestOptions } from "@/lib/api";
import type { WidgetType } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Dashboard Detail - Analytics Engine",
  description: "View dashboard and its widgets",
};

function widgetTypeLabel(type: WidgetType): string {
  const labels: Record<WidgetType, string> = {
    "line-chart": "Line Chart",
    "bar-chart": "Bar Chart",
    "pie-chart": "Pie Chart",
    metric: "Metric",
    table: "Table",
    "area-chart": "Area Chart",
  };
  return labels[type];
}

interface DashboardDetailContentProps {
  id: string;
}

async function DashboardDetailContent({ id }: DashboardDetailContentProps) {
  const options = await getServerRequestOptions();
  const dashboard = await apiClient.getDashboard(id, options);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{dashboard.name}</CardTitle>
          <CardDescription>{dashboard.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Created</dt>
              <dd className="mt-1 text-sm">
                {new Date(dashboard.createdAt).toLocaleString()}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Last Updated</dt>
              <dd className="mt-1 text-sm">
                {new Date(dashboard.updatedAt).toLocaleString()}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Widgets</dt>
              <dd className="mt-1 text-sm">{dashboard.widgets.length}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <section>
        <h2 className="mb-4 text-xl font-semibold">Widgets</h2>
        {dashboard.widgets.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-12">
              <p className="text-lg font-medium text-muted-foreground">
                No widgets added yet
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Add widgets to visualize your data.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {dashboard.widgets.map((widget) => (
              <Card key={widget.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{widget.title}</CardTitle>
                    <Badge variant="secondary">{widgetTypeLabel(widget.type)}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <dl className="space-y-2 text-sm">
                    <div>
                      <dt className="font-medium text-muted-foreground">Data Source</dt>
                      <dd className="font-mono text-xs">{widget.config.dataSourceId}</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-muted-foreground">Position</dt>
                      <dd>
                        ({widget.position.x}, {widget.position.y}) &mdash;{" "}
                        {widget.position.width}&times;{widget.position.height}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-medium text-muted-foreground">Refresh Interval</dt>
                      <dd>{widget.config.refreshInterval}s</dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="h-7 w-48 animate-pulse rounded bg-muted" />
          <div className="mt-2 h-4 w-64 animate-pulse rounded bg-muted" />
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-1">
                <div className="h-4 w-20 animate-pulse rounded bg-muted" />
                <div className="h-4 w-32 animate-pulse rounded bg-muted" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function DashboardDetailPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <div className="container mx-auto space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboards">
          <Button variant="ghost" size="sm">
            Back to Dashboards
          </Button>
        </Link>
      </div>
      <Suspense fallback={<DetailSkeleton />}>
        <DashboardDetailContent id={id} />
      </Suspense>
    </div>
  );
}
