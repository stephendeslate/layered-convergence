import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';

export default function WorkOrdersPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Work Orders</h1>
      <Card>
        <CardHeader>
          <CardTitle>Active Work Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>HVAC System Repair</TableCell>
                <TableCell>Acme Corp</TableCell>
                <TableCell><Badge variant="destructive">HIGH</Badge></TableCell>
                <TableCell><Badge>COMPLETED</Badge></TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Electrical Panel Inspection</TableCell>
                <TableCell>Beta Industries</TableCell>
                <TableCell><Badge variant="secondary">MEDIUM</Badge></TableCell>
                <TableCell><Badge variant="outline">CANCELLED</Badge></TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Plumbing Emergency</TableCell>
                <TableCell>Gamma LLC</TableCell>
                <TableCell><Badge variant="destructive">CRITICAL</Badge></TableCell>
                <TableCell><Badge variant="secondary">OPEN</Badge></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
