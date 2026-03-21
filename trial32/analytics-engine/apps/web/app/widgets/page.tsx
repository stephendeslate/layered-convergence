import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import type { WidgetDto } from '@analytics-engine/shared';

const API_URL = process.env.API_URL ?? 'http://localhost:3000';

async function getWidgets(): Promise<WidgetDto[]> {
  try {
    const response = await fetch(`${API_URL}/widgets`, { cache: 'no-store' });
    if (!response.ok) return [];
    return response.json() as Promise<WidgetDto[]>;
  } catch {
    return [];
  }
}

export default async function WidgetsPage() {
  const widgets = await getWidgets();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Widgets</h1>
      <Card>
        <CardHeader>
          <CardTitle>All Widgets</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {widgets.map((w) => (
                <TableRow key={w.id}>
                  <TableCell>{w.name}</TableCell>
                  <TableCell>{w.type}</TableCell>
                  <TableCell>{new Date(w.createdAt).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
              {widgets.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-[var(--muted-foreground)]">No widgets found</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
