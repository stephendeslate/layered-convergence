'use client';

import { useEffect, useState } from 'react';
import { fetchPipelines } from '@/app/actions';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Pipeline {
  id: string;
  name: string;
  status: string;
  schedule: string | null;
  tenantId: string;
}

export default function PipelinesPage() {
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const token = localStorage.getItem('token') ?? '';
      const tenantId = localStorage.getItem('tenantId') ?? '';
      const result = await fetchPipelines(token, tenantId);

      if ('error' in result) {
        setError(result.error);
      } else {
        setPipelines(result.data ?? result);
      }
      setLoading(false);
    }

    void load();
  }, []);

  if (loading) {
    return <p>Loading pipelines...</p>;
  }

  const statusVariant = (status: string) => {
    if (status === 'ACTIVE') return 'default' as const;
    if (status === 'FAILED') return 'destructive' as const;
    return 'secondary' as const;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Pipelines</h1>
        <p className="text-[var(--muted-foreground)]">Manage data processing pipelines</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Schedule</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pipelines.map((pipeline) => (
            <TableRow key={pipeline.id}>
              <TableCell className="font-medium">{pipeline.name}</TableCell>
              <TableCell>
                <Badge variant={statusVariant(pipeline.status)}>{pipeline.status}</Badge>
              </TableCell>
              <TableCell>{pipeline.schedule ?? 'Manual'}</TableCell>
            </TableRow>
          ))}
          {pipelines.length === 0 && !error && (
            <TableRow>
              <TableCell colSpan={3} className="text-center text-[var(--muted-foreground)]">
                No pipelines found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
