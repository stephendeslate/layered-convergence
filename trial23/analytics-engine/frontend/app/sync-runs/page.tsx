import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';

export default function SyncRunsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Sync Runs</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Synchronization History</CardTitle>
          <CardDescription>
            Track data synchronization runs. States: <Badge variant="secondary">PENDING</Badge>{' '}
            <Badge variant="secondary">RUNNING</Badge>{' '}
            <Badge>SUCCESS</Badge>{' '}
            <Badge variant="destructive">FAILED</Badge>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data Source</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Started</TableHead>
                <TableHead>Completed</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell colSpan={4} className="text-center text-[var(--muted-foreground)]">
                  No sync runs recorded.
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
