import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../../components/ui/table';
import { Badge } from '../../../../components/ui/badge';
import { truncate, PIPELINE_STATUSES } from '@analytics-engine/shared';
import { fetchPipelines } from '../../../../actions/pipeline-actions';

// TRACED: AE-UI-PIPE-001 — Pipelines page with shared imports
export default async function PipelinesPage() {
  const pipelines = await fetchPipelines();

  return (
    <div className="container mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold mb-6">Pipelines</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Last Run</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pipelines.map((p: { id: string; name: string; status: string; lastRun: string }) => (
            <TableRow key={p.id}>
              <TableCell>{truncate(p.name, 40)}</TableCell>
              <TableCell>
                <Badge
                  variant={
                    p.status === 'COMPLETED'
                      ? 'default'
                      : p.status === 'FAILED'
                        ? 'destructive'
                        : 'secondary'
                  }
                >
                  {p.status}
                </Badge>
              </TableCell>
              <TableCell>{p.lastRun}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
