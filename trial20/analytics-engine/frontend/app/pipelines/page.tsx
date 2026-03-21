import { cookies } from 'next/headers';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { API_URL } from '@/lib/utils';
import type { Pipeline } from '@/lib/types';

async function getPipelines(): Promise<Pipeline[]> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return [];

  const response = await fetch(`${API_URL}/pipelines`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });

  if (!response.ok) return [];
  return response.json();
}

function stateVariant(state: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (state) {
    case 'ACTIVE': return 'default';
    case 'PAUSED': return 'secondary';
    case 'ARCHIVED': return 'destructive';
    default: return 'outline';
  }
}

export default async function PipelinesPage() {
  const pipelines = await getPipelines();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Pipelines</h1>
        <Link href="/pipelines/new">
          <Button>New Pipeline</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Pipelines</CardTitle>
        </CardHeader>
        <CardContent>
          {pipelines.length === 0 ? (
            <p className="text-[var(--muted-foreground)]">No pipelines yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>State</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pipelines.map((pipeline) => (
                  <TableRow key={pipeline.id}>
                    <TableCell className="font-medium">{pipeline.name}</TableCell>
                    <TableCell>
                      <Badge variant={stateVariant(pipeline.state)}>{pipeline.state}</Badge>
                    </TableCell>
                    <TableCell>{new Date(pipeline.createdAt).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
