import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { PIPELINE_STATUS_TRANSITIONS } from '@analytics-engine/shared';
import type { PipelineStatus } from '@analytics-engine/shared';

// TRACED: AE-FE-011
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

const statusColors: Record<string, string> = {
  ACTIVE: 'green',
  PAUSED: 'orange',
  FAILED: 'red',
  COMPLETED: 'blue',
};

async function getPipelines() {
  const response = await fetch(`${API_URL}/pipelines`, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`Failed to fetch pipelines: ${response.status}`);
  }
  return response.json();
}

export default async function PipelinesPage() {
  let pipelines;
  try {
    const result = await getPipelines();
    pipelines = result.data ?? [];
  } catch {
    pipelines = [];
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Pipelines</h1>
        <Badge>{pipelines.length} total</Badge>
      </div>
      {pipelines.length === 0 ? (
        <Card>
          <CardContent>
            <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted-foreground)' }}>
              No pipelines configured. Set up your first data pipeline.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600 }}>All Pipelines</h2>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Schedule</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pipelines.map((pipeline: { id: string; name: string; status: string; schedule: string | null; createdAt: string }) => (
                  <TableRow key={pipeline.id}>
                    <TableCell style={{ fontWeight: 500 }}>{pipeline.name}</TableCell>
                    <TableCell>
                      <Badge style={{ backgroundColor: statusColors[pipeline.status] ?? 'gray', color: 'white' }}>
                        {pipeline.status}
                      </Badge>
                      {PIPELINE_STATUS_TRANSITIONS[pipeline.status as PipelineStatus]?.length > 0 && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', marginLeft: '0.5rem' }}>
                          → {PIPELINE_STATUS_TRANSITIONS[pipeline.status as PipelineStatus].join(', ')}
                        </span>
                      )}
                    </TableCell>
                    <TableCell style={{ color: 'var(--muted-foreground)' }}>
                      {pipeline.schedule ?? 'Manual'}
                    </TableCell>
                    <TableCell>{new Date(pipeline.createdAt).toLocaleDateString()}</TableCell>
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
