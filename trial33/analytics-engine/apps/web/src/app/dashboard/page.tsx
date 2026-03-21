import { Card, CardHeader, CardTitle, CardContent } from '../../../../components/ui/card';
import { Badge } from '../../../../components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../../components/ui/table';
import { formatDate, WIDGET_TYPES } from '@analytics-engine/shared';

// TRACED: AE-DM-DS-001 — Dashboard page using shared formatDate + constants
export default function DashboardPage() {
  const now = formatDate(new Date(), 'long');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboards</h1>
        <p className="text-sm text-muted-foreground">Last updated: {now}</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>All Dashboards</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Widgets</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Main Dashboard</TableCell>
                <TableCell>
                  {WIDGET_TYPES.map((t) => (
                    <Badge key={t} variant="secondary" className="mr-1">{t}</Badge>
                  ))}
                </TableCell>
                <TableCell>{formatDate(new Date())}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
