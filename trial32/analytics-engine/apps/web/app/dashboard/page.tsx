import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import type { DashboardDto } from '@analytics-engine/shared';

const API_URL = process.env.API_URL ?? 'http://localhost:3000';

async function getDashboards(): Promise<DashboardDto[]> {
  try {
    const response = await fetch(`${API_URL}/dashboards`, { cache: 'no-store' });
    if (!response.ok) return [];
    return response.json() as Promise<DashboardDto[]>;
  } catch {
    return [];
  }
}

export default async function DashboardPage() {
  const dashboards = await getDashboards();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboards</h1>
      <Card>
        <CardHeader>
          <CardTitle>All Dashboards</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dashboards.map((d) => (
                <TableRow key={d.id}>
                  <TableCell>{d.name}</TableCell>
                  <TableCell>{new Date(d.createdAt).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
              {dashboards.length === 0 && (
                <TableRow>
                  <TableCell colSpan={2} className="text-center text-[var(--muted-foreground)]">No dashboards found</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
