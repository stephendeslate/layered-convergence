import { cookies } from 'next/headers';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { API_URL } from '@/lib/utils';
import type { DataSource } from '@/lib/types';

async function getDataSources(): Promise<DataSource[]> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return [];

  const response = await fetch(`${API_URL}/data-sources`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });

  if (!response.ok) return [];
  return response.json();
}

export default async function DataSourcesPage() {
  const dataSources = await getDataSources();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Data Sources</h1>
        <Link href="/data-sources/new">
          <Button>New Data Source</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Data Sources</CardTitle>
        </CardHeader>
        <CardContent>
          {dataSources.length === 0 ? (
            <p className="text-[var(--muted-foreground)]">No data sources yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dataSources.map((ds) => (
                  <TableRow key={ds.id}>
                    <TableCell className="font-medium">{ds.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{ds.type}</Badge>
                    </TableCell>
                    <TableCell>{new Date(ds.createdAt).toLocaleDateString()}</TableCell>
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
