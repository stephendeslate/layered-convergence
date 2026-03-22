import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { DEFAULT_PAGE_SIZE } from '@analytics-engine/shared';

// TRACED: AE-FE-010
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

async function getDashboards() {
  const response = await fetch(`${API_URL}/dashboards`, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`Failed to fetch dashboards: ${response.status}`);
  }
  return response.json();
}

export default async function DashboardsPage() {
  let dashboards;
  try {
    const result = await getDashboards();
    dashboards = result.data ?? [];
  } catch {
    dashboards = [];
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Dashboards</h1>
        <Badge>{dashboards.length} total (page size: {DEFAULT_PAGE_SIZE})</Badge>
      </div>
      {dashboards.length === 0 ? (
        <Card>
          <CardContent>
            <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted-foreground)' }}>
              No dashboards found. Create your first dashboard to get started.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600 }}>All Dashboards</h2>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dashboards.map((dashboard: { id: string; name: string; description: string | null; createdAt: string }) => (
                  <TableRow key={dashboard.id}>
                    <TableCell style={{ fontWeight: 500 }}>{dashboard.name}</TableCell>
                    <TableCell style={{ color: 'var(--muted-foreground)' }}>
                      {dashboard.description ?? 'No description'}
                    </TableCell>
                    <TableCell>{new Date(dashboard.createdAt).toLocaleDateString()}</TableCell>
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
