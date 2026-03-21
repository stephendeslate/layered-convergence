import { Suspense } from 'react';
import { fetchDashboard } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';

async function DashboardDetail({ id }: { id: string }) {
  const dashboard = await fetchDashboard(id);

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold">{dashboard.name}</h1>
        {dashboard.isPublic && <Badge>Public</Badge>}
      </div>
      {dashboard.description && <p className="text-muted-foreground mb-6">{dashboard.description}</p>}

      <h2 className="text-lg font-semibold mb-4">Widgets ({dashboard.widgets.length})</h2>
      {dashboard.widgets.length === 0 ? (
        <p className="text-muted-foreground">No widgets configured.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dashboard.widgets.map((w) => (
              <TableRow key={w.id}>
                <TableCell>{w.title}</TableCell>
                <TableCell><Badge variant="outline">{w.type}</Badge></TableCell>
                <TableCell>{new Date(w.createdAt).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

export default async function DashboardDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <Suspense fallback={<div aria-busy="true">Loading dashboard...</div>}>
      <DashboardDetail id={id} />
    </Suspense>
  );
}
