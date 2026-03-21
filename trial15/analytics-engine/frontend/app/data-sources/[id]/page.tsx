import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { apiClient, getServerRequestOptions } from "@/lib/api";
import type { DataSource } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const metadata: Metadata = {
  title: "Data Source Detail - Analytics Engine",
  description: "View data source details and sync history",
};

function statusVariant(status: DataSource["status"]) {
  const map = {
    connected: "success" as const,
    disconnected: "secondary" as const,
    syncing: "warning" as const,
    error: "destructive" as const,
  };
  return map[status];
}

interface DataSourceDetailProps {
  id: string;
}

async function DataSourceDetail({ id }: DataSourceDetailProps) {
  const options = await getServerRequestOptions();
  const dataSource = await apiClient.getDataSource(id, options);
  const dataPoints = await apiClient.getDataPoints({ dataSourceId: id }, options);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{dataSource.name}</CardTitle>
              <CardDescription className="mt-1 capitalize">{dataSource.type}</CardDescription>
            </div>
            <Badge variant={statusVariant(dataSource.status)}>{dataSource.status}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Last Sync</dt>
              <dd className="mt-1 text-sm">
                {dataSource.lastSyncAt
                  ? new Date(dataSource.lastSyncAt).toLocaleString()
                  : "Never synced"}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Created</dt>
              <dd className="mt-1 text-sm">
                {new Date(dataSource.createdAt).toLocaleString()}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Updated</dt>
              <dd className="mt-1 text-sm">
                {new Date(dataSource.updatedAt).toLocaleString()}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">ID</dt>
              <dd className="mt-1 font-mono text-sm">{dataSource.id}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          {Object.keys(dataSource.config).length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Key</TableHead>
                  <TableHead>Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(dataSource.config).map(([key, value]) => (
                  <TableRow key={key}>
                    <TableCell className="font-medium">{key}</TableCell>
                    <TableCell className="font-mono text-sm">{value}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-sm text-muted-foreground">No configuration entries.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Data Points</CardTitle>
          <CardDescription>
            {dataPoints.total} total data point{dataPoints.total !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {dataPoints.data.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Key</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dataPoints.data.map((dp) => (
                  <TableRow key={dp.id}>
                    <TableCell className="font-medium">{dp.key}</TableCell>
                    <TableCell>{dp.value}</TableCell>
                    <TableCell>{new Date(dp.timestamp).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-sm text-muted-foreground">No data points recorded yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="h-7 w-48 animate-pulse rounded bg-muted" />
          <div className="mt-2 h-4 w-24 animate-pulse rounded bg-muted" />
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
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

export default async function DataSourceDetailPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <div className="container mx-auto space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Link href="/data-sources">
          <Button variant="ghost" size="sm">
            Back to Data Sources
          </Button>
        </Link>
      </div>
      <Suspense fallback={<DetailSkeleton />}>
        <DataSourceDetail id={id} />
      </Suspense>
    </div>
  );
}
