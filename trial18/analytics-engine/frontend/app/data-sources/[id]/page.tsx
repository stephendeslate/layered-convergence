import { Suspense } from 'react';
import { fetchDataSource } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';

async function DataSourceDetail({ id }: { id: string }) {
  const ds = await fetchDataSource(id);

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold">{ds.name}</h1>
        <Badge variant="outline">{ds.type}</Badge>
        <Badge variant="secondary">{ds.status}</Badge>
      </div>

      <div className="mb-6">
        <p className="text-sm text-muted-foreground">Sync Frequency: {ds.syncFrequency}</p>
        {ds.lastSyncAt && (
          <p className="text-sm text-muted-foreground">Last Sync: {new Date(ds.lastSyncAt).toLocaleString()}</p>
        )}
      </div>

      <h2 className="text-lg font-semibold mb-4">Recent Sync Runs</h2>
      {ds.syncRuns.length === 0 ? (
        <p className="text-muted-foreground">No sync runs yet.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Status</TableHead>
              <TableHead>Records</TableHead>
              <TableHead>Started</TableHead>
              <TableHead>Completed</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ds.syncRuns.map((run) => (
              <TableRow key={run.id}>
                <TableCell><Badge variant="outline">{run.status}</Badge></TableCell>
                <TableCell>{run.recordsProcessed}</TableCell>
                <TableCell>{new Date(run.startedAt).toLocaleString()}</TableCell>
                <TableCell>{run.completedAt ? new Date(run.completedAt).toLocaleString() : '-'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

export default async function DataSourceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <Suspense fallback={<div aria-busy="true">Loading data source...</div>}>
      <DataSourceDetail id={id} />
    </Suspense>
  );
}
