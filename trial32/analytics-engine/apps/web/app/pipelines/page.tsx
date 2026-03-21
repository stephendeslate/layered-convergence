import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { PipelineDto } from '@analytics-engine/shared';
import { PIPELINE_STATUSES } from '@analytics-engine/shared';

const API_URL = process.env.API_URL ?? 'http://localhost:3000';

async function getPipelines(): Promise<PipelineDto[]> {
  try {
    const response = await fetch(`${API_URL}/pipelines`, { cache: 'no-store' });
    if (!response.ok) return [];
    return response.json() as Promise<PipelineDto[]>;
  } catch {
    return [];
  }
}

function getStatusVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'ACTIVE': return 'default';
    case 'PAUSED': return 'secondary';
    case 'ARCHIVED': return 'outline';
    default: return 'secondary';
  }
}

export default async function PipelinesPage() {
  const pipelines = await getPipelines();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Pipelines</h1>
      <p className="text-sm text-[var(--muted-foreground)]">
        Valid statuses: {PIPELINE_STATUSES.join(', ')}
      </p>
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
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pipelines.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>{p.name}</TableCell>
                  <TableCell><Badge variant={getStatusVariant(p.status)}>{p.status}</Badge></TableCell>
                  <TableCell>{new Date(p.createdAt).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
              {pipelines.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-[var(--muted-foreground)]">No pipelines found</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
