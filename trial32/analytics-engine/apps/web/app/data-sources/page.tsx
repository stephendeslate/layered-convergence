import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import type { DataSourceDto } from '@analytics-engine/shared';

const API_URL = process.env.API_URL ?? 'http://localhost:3000';

async function getDataSources(): Promise<DataSourceDto[]> {
  try {
    const response = await fetch(`${API_URL}/data-sources`, { cache: 'no-store' });
    if (!response.ok) return [];
    return response.json() as Promise<DataSourceDto[]>;
  } catch {
    return [];
  }
}

export default async function DataSourcesPage() {
  const dataSources = await getDataSources();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Data Sources</h1>
      <Card>
        <CardHeader>
          <CardTitle>All Data Sources</CardTitle>
        </CardHeader>
        <CardContent>
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
                  <TableCell>{ds.name}</TableCell>
                  <TableCell>{ds.type}</TableCell>
                  <TableCell>{new Date(ds.createdAt).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
              {dataSources.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-[var(--muted-foreground)]">No data sources found</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
