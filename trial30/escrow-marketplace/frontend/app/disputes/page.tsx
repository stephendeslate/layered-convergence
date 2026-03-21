import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';

export default function DisputesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Disputes</h1>
      <Card>
        <CardHeader>
          <CardTitle>Active Disputes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reason</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Resolution</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Work not delivered as described</TableCell>
                <TableCell><Badge>Resolved</Badge></TableCell>
                <TableCell>Partial refund of 50% agreed</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Deadline missed by 2 weeks</TableCell>
                <TableCell><Badge variant="secondary">Open</Badge></TableCell>
                <TableCell>-</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Quality below expectations</TableCell>
                <TableCell><Badge variant="destructive">Escalated</Badge></TableCell>
                <TableCell>-</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
