import { Suspense } from 'react';
import { ApiClient } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';

async function DataSourceDetail({ id }: { id: string }) {
  const dataSource = await ApiClient.getDataSource(id);

  const statusVariant =
    dataSource.status === 'ACTIVE'
      ? 'success'
      : dataSource.status === 'ERROR'
        ? 'destructive'
        : 'warning';

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">{dataSource.name}</h1>
        <Badge variant={statusVariant as 'success' | 'destructive' | 'warning'}>
          {dataSource.status}
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Type</dt>
                <dd className="font-medium">{dataSource.type}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Created</dt>
                <dd className="font-medium">
                  {new Date(dataSource.createdAt).toLocaleDateString()}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Last Synced</dt>
                <dd className="font-medium">
                  {dataSource.lastSyncAt
                    ? new Date(dataSource.lastSyncAt).toLocaleString()
                    : 'Never'}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Connection Details</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="overflow-auto rounded-md bg-muted p-4 text-sm">
              {JSON.stringify(dataSource.config, null, 2)}
            </pre>
          </CardContent>
        </Card>
      </div>

      {dataSource.pipelines && dataSource.pipelines.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Associated Pipelines</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dataSource.pipelines.map((pipeline) => (
                  <TableRow key={pipeline.id}>
                    <TableCell className="font-medium">
                      {pipeline.name}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{pipeline.status}</Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(pipeline.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-64 animate-pulse rounded-md bg-muted" />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="h-48 animate-pulse rounded-lg border bg-muted" />
        <div className="h-48 animate-pulse rounded-lg border bg-muted" />
      </div>
    </div>
  );
}

export default async function DataSourceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <Suspense fallback={<DetailSkeleton />}>
      <DataSourceDetail id={id} />
    </Suspense>
  );
}
