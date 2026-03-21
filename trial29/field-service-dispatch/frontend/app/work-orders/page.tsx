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

export default function WorkOrdersPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Work Orders</h1>
      <Card>
        <CardHeader>
          <CardTitle>All Work Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Technician</TableHead>
                <TableHead>Scheduled</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>HVAC annual inspection</TableCell>
                <TableCell>Riverside Office Park</TableCell>
                <TableCell><Badge>IN_PROGRESS</Badge></TableCell>
                <TableCell>High</TableCell>
                <TableCell>Jake Morrison</TableCell>
                <TableCell>Mar 25, 2026</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Emergency generator repair</TableCell>
                <TableCell>Downtown Medical Center</TableCell>
                <TableCell><Badge variant="secondary">ASSIGNED</Badge></TableCell>
                <TableCell>Critical</TableCell>
                <TableCell>Maria Chen</TableCell>
                <TableCell>Mar 22, 2026</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Water heater replacement</TableCell>
                <TableCell>Eastside Warehouse</TableCell>
                <TableCell><Badge variant="outline">PENDING</Badge></TableCell>
                <TableCell>Normal</TableCell>
                <TableCell>Unassigned</TableCell>
                <TableCell>Mar 28, 2026</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
