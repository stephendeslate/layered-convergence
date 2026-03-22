// TRACED: AE-FE-07
import { formatBytes } from '@analytics-engine/shared';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';

interface Pipeline {
  id: string;
  name: string;
  status: string;
  schedule: string | null;
  dataProcessed: number;
}

const placeholderPipelines: Pipeline[] = [
  {
    id: '1',
    name: 'Daily ETL',
    status: 'ACTIVE',
    schedule: '0 2 * * *',
    dataProcessed: 1073741824,
  },
  {
    id: '2',
    name: 'Legacy Import',
    status: 'FAILED',
    schedule: '0 4 * * 1',
    dataProcessed: 524288000,
  },
  {
    id: '3',
    name: 'Hourly Sync',
    status: 'PAUSED',
    schedule: '0 * * * *',
    dataProcessed: 268435456,
  },
];

export default function PipelinesPage() {
  const pipelines = placeholderPipelines;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Pipelines</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Manage your data processing pipelines.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Pipelines</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Schedule</TableHead>
                <TableHead>Data Processed</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pipelines.map((pipeline) => (
                <TableRow key={pipeline.id}>
                  <TableCell className="font-medium">{pipeline.name}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        pipeline.status === 'ACTIVE'
                          ? 'default'
                          : pipeline.status === 'FAILED'
                            ? 'destructive'
                            : 'secondary'
                      }
                    >
                      {pipeline.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{pipeline.schedule ?? 'Manual'}</TableCell>
                  <TableCell>{formatBytes(pipeline.dataProcessed)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
