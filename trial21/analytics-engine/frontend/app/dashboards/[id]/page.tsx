import { cookies } from 'next/headers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
    return <p className="text-[var(--muted-foreground)]">Dashboard not found.</p>;
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
            <p className="text-[var(--muted-foreground)]">No widgets in this dashboard.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {dashboard.widgets.map((widget) => (
                <Card key={widget.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{widget.title}</span>
                      <Badge>{widget.type}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
