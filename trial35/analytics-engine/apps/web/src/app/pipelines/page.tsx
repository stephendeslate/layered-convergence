// TRACED: AE-UI-PIPE-001 — Pipelines list page
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../../components/ui/table';
import { Badge } from '../../../../components/ui/badge';
import { Button } from '../../../../components/ui/button';

export default function PipelinesPage() {
  const pipelines = [
    { id: '1', name: 'ETL Main', source: 'PostgreSQL', status: 'ACTIVE', schedule: 'Every 1h' },
    { id: '2', name: 'User Events', source: 'Kafka', status: 'PAUSED', schedule: 'Real-time' },
    { id: '3', name: 'Reporting', source: 'S3', status: 'DRAFT', schedule: 'Daily' },
  ];

  const statusVariant = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'default' as const;
      case 'PAUSED': return 'secondary' as const;
      case 'FAILED': return 'destructive' as const;
      default: return 'outline' as const;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Data Pipelines</h1>
        <Button>Create Pipeline</Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Source</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Schedule</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pipelines.map((pipeline) => (
            <TableRow key={pipeline.id}>
              <TableCell className="font-medium">{pipeline.name}</TableCell>
              <TableCell>{pipeline.source}</TableCell>
              <TableCell>
                <Badge variant={statusVariant(pipeline.status)}>{pipeline.status}</Badge>
              </TableCell>
              <TableCell>{pipeline.schedule}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
