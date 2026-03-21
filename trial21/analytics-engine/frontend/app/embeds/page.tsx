import { cookies } from 'next/headers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { API_URL } from '@/lib/utils';
import type { Embed } from '@/lib/types';

async function getEmbeds(): Promise<Embed[]> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return [];

  const response = await fetch(`${API_URL}/embeds`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });

  if (!response.ok) return [];
  return response.json();
}

function isExpired(expiresAt: string): boolean {
  return new Date() > new Date(expiresAt);
}

export default async function EmbedsPage() {
  const embeds = await getEmbeds();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Embeds</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Embeds</CardTitle>
        </CardHeader>
        <CardContent>
          {embeds.length === 0 ? (
            <p className="text-[var(--muted-foreground)]">No embeds yet. Create embeds from a dashboard detail page.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Token</TableHead>
                  <TableHead>Dashboard</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {embeds.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell className="font-mono text-sm">{e.token.slice(0, 12)}...</TableCell>
                    <TableCell>{e.dashboardId}</TableCell>
                    <TableCell>
                      <Badge variant={isExpired(e.expiresAt) ? 'destructive' : 'default'}>
                        {isExpired(e.expiresAt) ? 'Expired' : 'Active'}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(e.expiresAt).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(e.createdAt).toLocaleDateString()}</TableCell>
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
