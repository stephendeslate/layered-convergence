import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { SyncRunDto } from '@analytics-engine/shared';

const API_URL = process.env.API_URL ?? 'http://localhost:3000';

async function getSyncRuns(): Promise<SyncRunDto[]> {
  try {
    const response = await fetch(`${API_URL}/sync-runs`, { cache: 'no-store' });
    if (!response.ok) return [];
    return response.json() as Promise<SyncRunDto[]>;
  } catch {
    return [];
  }
}

export default async function SyncRunsPage() {
  const syncRuns = await getSyncRuns();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Sync Runs</h1>
      <Card>
        <CardHeader>
          <CardTitle>All Sync Runs</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Started</TableHead>
                <TableHead>Completed</TableHead>
                <TableHead>Error</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {syncRuns.map((sr) => (
                <TableRow key={sr.id}>
                  <TableCell className="font-mono text-xs">{sr.id.slice(0, 8)}</TableCell>
                  <TableCell>
                    <Badge variant={sr.status === 'FAILED' ? 'destructive' : sr.status === 'COMPLETED' ? 'default' : 'secondary'}>
                      {sr.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{sr.startedAt ? new Date(sr.startedAt).toLocaleString() : '-'}</TableCell>
                  <TableCell>{sr.completedAt ? new Date(sr.completedAt).toLocaleString() : '-'}</TableCell>
                  <TableCell>{sr.errorMessage ?? '-'}</TableCell>
                </TableRow>
              ))}
              {syncRuns.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-[var(--muted-foreground)]">No sync runs found</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
