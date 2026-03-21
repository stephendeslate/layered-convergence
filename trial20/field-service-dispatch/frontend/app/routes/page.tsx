import { redirect } from 'next/navigation';
import { getCurrentUser, fetchWithAuth } from '@/lib/auth';
import { Card, CardContent } from '@/components/ui/card';
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
      <h1 className="text-3xl font-bold">Routes</h1>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Technician</TableHead>
                <TableHead>Work Order</TableHead>
                <TableHead>Distance (mi)</TableHead>
                <TableHead>Est. Minutes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {routes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    No routes yet.
                  </TableCell>
                </TableRow>
              ) : (
                routes.map((route) => (
                  <TableRow key={route.id}>
                    <TableCell>{route.technician?.user?.email}</TableCell>
                    <TableCell>{route.workOrder?.title}</TableCell>
                    <TableCell>{route.distance.toFixed(1)}</TableCell>
                    <TableCell>{route.estimatedMinutes}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
