import { redirect } from 'next/navigation';
import { getCurrentUser, fetchWithAuth } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { Route } from '@/lib/types';

export default async function RoutesPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  let routes: Route[] = [];
  const response = await fetchWithAuth('/routes');
  if (response.ok) {
    routes = await response.json();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Routes</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Routes</CardTitle>
        </CardHeader>
        <CardContent>
          {routes.length === 0 ? (
            <p className="text-muted-foreground">No routes found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Technician</TableHead>
                  <TableHead>Work Order</TableHead>
                  <TableHead>Distance (km)</TableHead>
                  <TableHead>Estimated Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {routes.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">
                      {r.technician?.user.email || r.technicianId}
                    </TableCell>
                    <TableCell>{r.workOrder?.title || r.workOrderId}</TableCell>
                    <TableCell>{r.distance}</TableCell>
                    <TableCell>{r.estimatedMinutes} min</TableCell>
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
