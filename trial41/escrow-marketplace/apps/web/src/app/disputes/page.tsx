import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';

export default function DisputesPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Disputes</h1>
      <Card>
        <CardHeader>
          <CardTitle>Dispute Resolution Center</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reason</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Filed</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Item not as described</TableCell>
                <TableCell><Badge variant="destructive">Open</Badge></TableCell>
                <TableCell>2024-01-20</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
