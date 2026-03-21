import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function DashboardPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Pipelines</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">12</p>
            <p className="text-[var(--muted-foreground)]">Active pipelines</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Data Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">5</p>
            <p className="text-[var(--muted-foreground)]">Connected sources</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Sync Runs</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">248</p>
            <p className="text-[var(--muted-foreground)]">Completed this week</p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Recent Pipeline Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pipeline</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Run</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Sales ETL</TableCell>
                <TableCell><Badge>ACTIVE</Badge></TableCell>
                <TableCell>2 hours ago</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Marketing Sync</TableCell>
                <TableCell><Badge variant="secondary">PAUSED</Badge></TableCell>
                <TableCell>1 day ago</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Inventory Feed</TableCell>
                <TableCell><Badge>ACTIVE</Badge></TableCell>
                <TableCell>30 minutes ago</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
