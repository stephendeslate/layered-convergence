import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { apiClient, getServerRequestOptions } from "@/lib/api";
import type { DataSource } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const metadata: Metadata = {
  title: "Data Sources - Analytics Engine",
  description: "Manage your connected data sources",
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

async function DataSourcesTable() {
  const options = await getServerRequestOptions();
  const response = await apiClient.getDataSources(options);
  const dataSources = response.data;

  if (dataSources.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center p-12">
          <p className="text-lg font-medium text-muted-foreground">
            No data sources configured
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Connect your first data source to get started.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Last Sync</TableHead>
            <TableHead>Created</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {dataSources.map((ds) => (
            <TableRow key={ds.id}>
              <TableCell>
                <Link
                  href={`/data-sources/${ds.id}`}
                  className="font-medium text-primary hover:underline"
                >
                  {ds.name}
                </Link>
              </TableCell>
              <TableCell className="capitalize">{ds.type}</TableCell>
              <TableCell>
                <Badge variant={statusVariant(ds.status)}>{ds.status}</Badge>
              </TableCell>
              <TableCell>
                {ds.lastSyncAt
                  ? new Date(ds.lastSyncAt).toLocaleDateString()
                  : "Never"}
              </TableCell>
              <TableCell>{new Date(ds.createdAt).toLocaleDateString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}

function DataSourcesTableSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="h-5 w-32 animate-pulse rounded bg-muted" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-10 animate-pulse rounded bg-muted" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function DataSourcesPage() {
  return (
    <div className="container mx-auto space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Data Sources</h1>
      </div>
      <Suspense fallback={<DataSourcesTableSkeleton />}>
        <DataSourcesTable />
      </Suspense>
    </div>
  );
}
