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
            <CardTitle>Work Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">24</p>
            <p className="text-[var(--muted-foreground)]">Active work orders</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Technicians</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">8</p>
            <p className="text-[var(--muted-foreground)]">In the field today</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Routes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">6</p>
            <p className="text-[var(--muted-foreground)]">Active routes</p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Recent Work Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Technician</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>HVAC annual inspection</TableCell>
                <TableCell><Badge>IN_PROGRESS</Badge></TableCell>
                <TableCell>High</TableCell>
                <TableCell>Jake Morrison</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Emergency generator repair</TableCell>
                <TableCell><Badge variant="secondary">ASSIGNED</Badge></TableCell>
                <TableCell>Critical</TableCell>
                <TableCell>Maria Chen</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Water heater replacement</TableCell>
                <TableCell><Badge variant="outline">PENDING</Badge></TableCell>
                <TableCell>Normal</TableCell>
                <TableCell>Unassigned</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
