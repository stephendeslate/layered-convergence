import { fetchDashboard } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { deleteDashboard, createEmbed } from '@/app/actions';

export default async function DashboardDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const dashboard = await fetchDashboard(id);

  return (
    <div className="space-y-6" aria-live="polite">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{dashboard.name}</h1>
          <p className="text-muted-foreground">{dashboard.description ?? 'No description'}</p>
        </div>
        <div className="flex gap-2">
          <form action={createEmbed}>
            <input type="hidden" name="dashboardId" value={dashboard.id} />
            <Button type="submit" variant="outline" aria-label="Create embed link">
              Create Embed
            </Button>
          </form>
          <form action={deleteDashboard}>
            <input type="hidden" name="dashboardId" value={dashboard.id} />
            <Button type="submit" variant="destructive" aria-label="Delete dashboard">
              Delete
            </Button>
          </form>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Widgets</CardTitle>
        </CardHeader>
        <CardContent>
          {dashboard.widgets.length === 0 ? (
            <p className="text-muted-foreground">No widgets yet.</p>
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
                      <Badge variant="outline">{widget.type}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {dashboard.embeds.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Embeds</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Token</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Expires</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dashboard.embeds.map((embed) => (
                  <TableRow key={embed.id}>
                    <TableCell className="font-mono text-xs">{embed.token}</TableCell>
                    <TableCell>
                      <Badge variant={embed.isActive ? 'default' : 'destructive'}>
                        {embed.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>{embed.expiresAt ?? 'Never'}</TableCell>
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
