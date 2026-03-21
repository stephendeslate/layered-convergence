import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { EmbedDto } from '@analytics-engine/shared';

const API_URL = process.env.API_URL ?? 'http://localhost:3000';

async function getEmbeds(): Promise<EmbedDto[]> {
  try {
    const response = await fetch(`${API_URL}/embeds`, { cache: 'no-store' });
    if (!response.ok) return [];
    return response.json() as Promise<EmbedDto[]>;
  } catch {
    return [];
  }
}

export default async function EmbedsPage() {
  const embeds = await getEmbeds();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Embeds</h1>
      <Card>
        <CardHeader>
          <CardTitle>All Embeds</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Token</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {embeds.map((e) => (
                <TableRow key={e.id}>
                  <TableCell className="font-mono text-xs">{e.token.slice(0, 8)}...</TableCell>
                  <TableCell>
                    <Badge variant={e.isActive ? 'default' : 'secondary'}>
                      {e.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(e.createdAt).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
              {embeds.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-[var(--muted-foreground)]">No embeds found</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
