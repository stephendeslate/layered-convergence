import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">Dashboard</h1>

      <div className="mb-8 grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-[var(--muted-foreground)]">
              Pending Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">8</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-[var(--muted-foreground)]">
              Active Routes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">3</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-[var(--muted-foreground)]">
              Technicians On-Site
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">5</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-[var(--muted-foreground)]">
              Unpaid Invoices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">$2,450</p>
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
                <TableHead>Customer</TableHead>
                <TableHead>Technician</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>HVAC Repair — Unit 3B</TableCell>
                <TableCell>Acme Corp</TableCell>
                <TableCell>Alice Tech</TableCell>
                <TableCell><Badge>COMPLETED</Badge></TableCell>
                <TableCell>2</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Plumbing Check — Suite 101</TableCell>
                <TableCell>Acme Corp</TableCell>
                <TableCell>Alice Tech</TableCell>
                <TableCell><Badge variant="destructive">CANCELLED</Badge></TableCell>
                <TableCell>4</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Electrical Panel Upgrade</TableCell>
                <TableCell>Beta Industries</TableCell>
                <TableCell>Unassigned</TableCell>
                <TableCell><Badge variant="secondary">PENDING</Badge></TableCell>
                <TableCell>1</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
