import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { API_URL } from '@/lib/utils';
import type { Dashboard } from '@/lib/types';

async function getDashboard(id: string): Promise<Dashboard | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return null;

  const response = await fetch(`${API_URL}/dashboards/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });

  if (!response.ok) return null;
  return response.json();
}

export default async function DashboardDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const dashboard = await getDashboard(id);

  if (!dashboard) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{dashboard.name}</h1>

      <Card>
        <CardHeader>
          <CardTitle>Widgets</CardTitle>
        </CardHeader>
        <CardContent>
          {(!dashboard.widgets || dashboard.widgets.length === 0) ? (
            <p className="text-[var(--muted-foreground)]">No widgets yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dashboard.widgets.map((widget) => (
                  <TableRow key={widget.id}>
                    <TableCell>{widget.title}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{widget.type}</Badge>
                    </TableCell>
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
