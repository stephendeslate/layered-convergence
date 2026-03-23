'use client';

import { useEffect, useState } from 'react';
import { fetchDataSources } from '@/app/actions';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface DataSource {
  id: string;
  name: string;
  type: string;
  status: string;
  tenantId: string;
}

export default function DataSourcesPage() {
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const token = localStorage.getItem('token') ?? '';
      const tenantId = localStorage.getItem('tenantId') ?? '';
      const result = await fetchDataSources(token, tenantId);

      if ('error' in result) {
        setError(result.error);
      } else {
        setDataSources(result.data ?? result);
      }
      setLoading(false);
    }

    void load();
  }, []);

  if (loading) {
    return <p>Loading data sources...</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Data Sources</h1>
        <p className="text-[var(--muted-foreground)]">Manage connected data sources</p>
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
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {dataSources.map((ds) => (
            <TableRow key={ds.id}>
              <TableCell className="font-medium">{ds.name}</TableCell>
              <TableCell>{ds.type}</TableCell>
              <TableCell>
                <Badge variant={ds.status === 'ACTIVE' ? 'default' : 'secondary'}>
                  {ds.status}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
          {dataSources.length === 0 && !error && (
            <TableRow>
              <TableCell colSpan={3} className="text-center text-[var(--muted-foreground)]">
                No data sources found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
