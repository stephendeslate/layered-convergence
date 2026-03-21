import { cookies } from 'next/headers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { API_URL } from '@/lib/utils';
import type { Dashboard, Widget } from '@/lib/types';

async function getAllWidgets(): Promise<(Widget & { dashboardName: string })[]> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return [];

  const response = await fetch(`${API_URL}/dashboards`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });

  if (!response.ok) return [];
  const dashboards: Dashboard[] = await response.json();

  const widgets: (Widget & { dashboardName: string })[] = [];
  for (const dashboard of dashboards) {
    const detailResponse = await fetch(`${API_URL}/dashboards/${dashboard.id}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    if (detailResponse.ok) {
      const detail: Dashboard = await detailResponse.json();
      if (detail.widgets) {
        for (const w of detail.widgets) {
          widgets.push({ ...w, dashboardName: dashboard.name });
        }
      }
    }
  }
  return widgets;
}

export default async function WidgetsPage() {
  const widgets = await getAllWidgets();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Widgets</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Widgets</CardTitle>
        </CardHeader>
        <CardContent>
          {widgets.length === 0 ? (
            <p className="text-[var(--muted-foreground)]">No widgets yet. Create widgets from a dashboard detail page.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Dashboard</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {widgets.map((w) => (
                  <TableRow key={w.id}>
                    <TableCell className="font-medium">{w.title}</TableCell>
                    <TableCell><Badge variant="secondary">{w.type}</Badge></TableCell>
                    <TableCell>{w.dashboardName}</TableCell>
                    <TableCell>{new Date(w.createdAt).toLocaleDateString()}</TableCell>
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
