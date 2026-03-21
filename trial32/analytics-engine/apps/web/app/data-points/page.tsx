import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import type { DataPointDto } from '@analytics-engine/shared';
import { formatCurrency } from '@analytics-engine/shared';

const API_URL = process.env.API_URL ?? 'http://localhost:3000';

async function getDataPoints(): Promise<DataPointDto[]> {
  try {
    const response = await fetch(`${API_URL}/data-points`, { cache: 'no-store' });
    if (!response.ok) return [];
    return response.json() as Promise<DataPointDto[]>;
  } catch {
    return [];
  }
}

export default async function DataPointsPage() {
  const dataPoints = await getDataPoints();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Data Points</h1>
      <Card>
        <CardHeader>
          <CardTitle>All Data Points</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Label</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Formatted</TableHead>
                <TableHead>Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dataPoints.map((dp) => (
                <TableRow key={dp.id}>
                  <TableCell>{dp.label}</TableCell>
                  <TableCell>{dp.value}</TableCell>
                  <TableCell>{formatCurrency(Number(dp.value))}</TableCell>
                  <TableCell>{new Date(dp.timestamp).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
              {dataPoints.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-[var(--muted-foreground)]">No data points found</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
