// TRACED:AE-FE-05 — Pipelines page with server action data fetching

import { fetchPipelines } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { slugify } from '@analytics-engine/shared';

const statusVariant = (status: string) => {
  switch (status) {
    case 'RUNNING': return 'default' as const;
    case 'COMPLETED': return 'secondary' as const;
    case 'FAILED': return 'destructive' as const;
    default: return 'outline' as const;
  }
};

export default async function PipelinesPage() {
  const pipelines = await fetchPipelines();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Pipelines</h1>

      {pipelines.length === 0 ? (
        <p className="text-muted-foreground">No pipelines configured.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Schedule</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pipelines.map((pipeline: { id: string; name: string; status: string; schedule?: string }) => (
              <TableRow key={pipeline.id}>
                <TableCell className="font-medium">{pipeline.name}</TableCell>
                <TableCell className="text-muted-foreground">{slugify(pipeline.name)}</TableCell>
                <TableCell>
                  <Badge variant={statusVariant(pipeline.status)}>{pipeline.status}</Badge>
                </TableCell>
                <TableCell>{pipeline.schedule || 'Manual'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
