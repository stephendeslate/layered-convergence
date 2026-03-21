import { redirect } from 'next/navigation';
import { getCurrentUser, fetchWithAuth } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { WorkOrder } from '@/lib/types';

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  let workOrders: WorkOrder[] = [];
  const response = await fetchWithAuth('/work-orders');
  if (response.ok) {
    workOrders = await response.json();
  }

  const pending = workOrders.filter((wo) => wo.status === 'PENDING').length;
  const assigned = workOrders.filter((wo) => wo.status === 'ASSIGNED').length;
  const inProgress = workOrders.filter((wo) => wo.status === 'IN_PROGRESS').length;
  const completed = workOrders.filter((wo) => wo.status === 'COMPLETED').length;
  const onHold = workOrders.filter((wo) => wo.status === 'ON_HOLD').length;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Assigned</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assigned}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inProgress}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">On Hold</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{onHold}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Work Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {workOrders.length === 0 ? (
            <p className="text-muted-foreground">No work orders yet.</p>
          ) : (
            <ul className="space-y-2">
              {workOrders.slice(0, 10).map((wo) => (
                <li key={wo.id} className="flex items-center justify-between rounded-md border p-3">
                  <div>
                    <span className="font-medium">{wo.title}</span>
                    <span className="ml-2 text-sm text-muted-foreground">
                      {wo.customer?.name}
                    </span>
                  </div>
                  <Badge
                    variant={
                      wo.status === 'COMPLETED'
                        ? 'success'
                        : wo.status === 'ON_HOLD'
                          ? 'warning'
                          : wo.status === 'IN_PROGRESS'
                            ? 'default'
                            : 'secondary'
                    }
                  >
                    {wo.status}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
