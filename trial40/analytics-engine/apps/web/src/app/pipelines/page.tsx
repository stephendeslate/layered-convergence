import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';

const mockPipelines = [
  { id: '1', name: 'ETL Pipeline', status: 'COMPLETED', schedule: '0 * * * *' },
  { id: '2', name: 'Real-time Ingestion', status: 'RUNNING', schedule: null },
  { id: '3', name: 'Failed Pipeline', status: 'FAILED', schedule: '0 0 * * *' },
  { id: '4', name: 'Idle Pipeline', status: 'IDLE', schedule: '0 6 * * 1' },
];

const statusVariant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  COMPLETED: 'default',
  RUNNING: 'secondary',
  FAILED: 'destructive',
  IDLE: 'outline',
};

export default function PipelinesPage(): React.ReactElement {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Pipelines</h1>

      <Card>
        <CardHeader>
          <CardTitle>Pipeline Status</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Schedule</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockPipelines.map((pipeline) => (
                <TableRow key={pipeline.id}>
                  <TableCell className="font-medium">{pipeline.name}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[pipeline.status] || 'default'}>
                      {pipeline.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-[var(--muted-foreground)]">
                    {pipeline.schedule || 'Manual'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
